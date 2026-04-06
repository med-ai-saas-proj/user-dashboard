import { useState } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { toast } from "sonner";
import {
	NetworkIcon,
	ServerIcon,
	PlayIcon,
	PlusIcon,
	LayersIcon,
	BarChart3Icon,
	CheckCircle2Icon,
	AlertCircleIcon,
} from "lucide-react";

const FL_BASE = `${BASE_API_URL}service/api/v1/federated`;

const MODEL_TYPES = [
	{ value: "logistic_regression", label: "Logistic Regression" },
	{ value: "random_forest", label: "Random Forest" },
	{ value: "neural_network", label: "Neural Network" },
	{ value: "gradient_boosting", label: "Gradient Boosting" },
];

const STATUS_COLORS: Record<string, string> = {
	created: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	recruiting:
		"bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
	training:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
	completed:
		"bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
	paused: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

interface Project {
	project_id: string;
	name: string;
	status: string;
	model_type: string;
	facilities: {
		facility_id: string;
		facility_name: string;
		sample_count: number;
	}[];
	current_round: number;
	max_rounds: number;
	created_at: string;
}

interface RoundMetric {
	round: number;
	loss: number;
	accuracy: number;
	status: string;
	facilities: number;
}

export default function FederatedLearningPage() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [metrics, setMetrics] = useState<RoundMetric[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const [newName, setNewName] = useState("Diabetes Risk Prediction");
	const [newDesc, setNewDesc] = useState(
		"Predict T2DM risk across hospitals without sharing patient data"
	);
	const [newModel, setNewModel] = useState("logistic_regression");
	const [newTarget, setNewTarget] = useState("risk_score");
	const [newFeatures, setNewFeatures] = useState(
		"age,bmi,glucose,blood_pressure,hba1c"
	);
	const [newMinFac, setNewMinFac] = useState("2");
	const [newMaxRounds, setNewMaxRounds] = useState("5");

	const [joinFacId, setJoinFacId] = useState("");
	const [joinFacName, setJoinFacName] = useState("");
	const [joinSamples, setJoinSamples] = useState("1000");

	const guardApiKey = () => {
		return true;
	};

	const fetchProjects = async () => {
		if (!guardApiKey()) return;
		try {
			const headers = await getAuthHeaders(`${FL_BASE}/projects`);
			const resp = await fetch(`${FL_BASE}/projects`, { headers });
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			setProjects(await resp.json());
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to fetch projects"
			);
		}
	};

	const createProject = async () => {
		if (!guardApiKey()) return;
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(`${FL_BASE}/projects`);
			const resp = await fetch(`${FL_BASE}/projects`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					name: newName,
					description: newDesc,
					model_type: newModel,
					target_variable: newTarget,
					feature_columns: newFeatures
						.split(",")
						.map((s) => s.trim())
						.filter(Boolean),
					min_facilities: parseInt(newMinFac, 10),
					max_rounds: parseInt(newMaxRounds, 10),
				}),
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const project = await resp.json();
			toast.success(`Project "${project.name}" created`);
			setProjects((prev) => [project, ...prev]);
			setSelectedProject(project);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		} finally {
			setIsLoading(false);
		}
	};

	const joinFacility = async () => {
		if (!guardApiKey() || !selectedProject) return;
		try {
			const url = `${FL_BASE}/projects/${selectedProject.project_id}/join`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					facility_id: joinFacId || `fac-${Date.now()}`,
					facility_name: joinFacName || "Hospital A",
					sample_count: parseInt(joinSamples, 10) || 1000,
					data_stats: { mean_age: 55, diabetes_pct: 0.12 },
				}),
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const result = await resp.json();
			toast.success(result.message || "Facility joined");
			await refreshSelected();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		}
	};

	const startRound = async () => {
		if (!guardApiKey() || !selectedProject) return;
		try {
			const url = `${FL_BASE}/projects/${selectedProject.project_id}/rounds`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { method: "POST", headers });
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			toast.success(`Round started`);
			await refreshSelected();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		}
	};

	const submitUpdate = async (facilityId: string, roundId: number) => {
		if (!guardApiKey() || !selectedProject) return;
		try {
			const url = `${FL_BASE}/projects/${selectedProject.project_id}/updates`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, {
				method: "POST",
				headers,
				body: JSON.stringify({
					facility_id: facilityId,
					round_id: roundId,
					gradients: { w1: Math.random() * 0.1, w2: Math.random() * 0.1 },
					local_loss: +(0.3 + Math.random() * 0.4).toFixed(4),
					local_accuracy: +(0.6 + Math.random() * 0.35).toFixed(4),
					samples_used: 500 + Math.floor(Math.random() * 1000),
				}),
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const result = await resp.json();
			toast.success(`Update from ${facilityId}: ${result.round_status}`);
			await refreshSelected();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		}
	};

	const fetchMetrics = async (projectId: string) => {
		try {
			const url = `${FL_BASE}/projects/${projectId}/metrics`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { headers });
			if (!resp.ok) return;
			const data = await resp.json();
			setMetrics(data.rounds || []);
		} catch {
			/* ignore */
		}
	};

	const refreshSelected = async () => {
		if (!selectedProject) return;
		try {
			const url = `${FL_BASE}/projects/${selectedProject.project_id}`;
			const headers = await getAuthHeaders(url);
			const resp = await fetch(url, { headers });
			if (!resp.ok) return;
			const p = await resp.json();
			setSelectedProject(p);
			setProjects((prev) =>
				prev.map((x) => (x.project_id === p.project_id ? p : x))
			);
			await fetchMetrics(p.project_id);
		} catch {
			/* ignore */
		}
	};

	const runDemo = async () => {
		if (!guardApiKey()) return;
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(`${FL_BASE}/projects`);
			const createResp = await fetch(`${FL_BASE}/projects`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					name: "Demo: Diabetes Risk Model",
					description: "Automated demo — 3 hospitals, 3 rounds",
					model_type: "logistic_regression",
					target_variable: "risk_score",
					feature_columns: ["age", "bmi", "glucose", "hba1c"],
					min_facilities: 3,
					max_rounds: 3,
				}),
			});
			const project = await createResp.json();
			const pid = project.project_id;
			toast.success("Created project");

			const facilities = [
				{
					facility_id: "hosp-a",
					facility_name: "Bach Mai Hospital",
					sample_count: 2500,
				},
				{
					facility_id: "hosp-b",
					facility_name: "Cho Ray Hospital",
					sample_count: 1800,
				},
				{
					facility_id: "hosp-c",
					facility_name: "108 Military Hospital",
					sample_count: 3200,
				},
			];
			for (const f of facilities) {
				await fetch(`${FL_BASE}/projects/${pid}/join`, {
					method: "POST",
					headers,
					body: JSON.stringify({
						...f,
						data_stats: { mean_age: 50 + Math.random() * 10 },
					}),
				});
			}
			toast.success("3 hospitals joined");

			for (let round = 1; round <= 3; round++) {
				await fetch(`${FL_BASE}/projects/${pid}/rounds`, {
					method: "POST",
					headers,
				});
				for (const f of facilities) {
					const baseLoss = 0.5 - round * 0.12;
					const baseAcc = 0.55 + round * 0.12;
					await fetch(`${FL_BASE}/projects/${pid}/updates`, {
						method: "POST",
						headers,
						body: JSON.stringify({
							facility_id: f.facility_id,
							round_id: round,
							gradients: {},
							local_loss: +(baseLoss + Math.random() * 0.1).toFixed(4),
							local_accuracy: +(baseAcc + Math.random() * 0.08).toFixed(4),
							samples_used: f.sample_count,
						}),
					});
				}
				toast.success(`Round ${round} complete`);
			}

			await fetchProjects();
			const detailResp = await fetch(`${FL_BASE}/projects/${pid}`, { headers });
			const detail = await detailResp.json();
			setSelectedProject(detail);
			await fetchMetrics(pid);
			toast.success("Demo complete!");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Demo failed");
		} finally {
			setIsLoading(false);
		}
	};

	const maxAcc =
		metrics.length > 0 ? Math.max(...metrics.map((m) => m.accuracy)) : 0;

	return (
		<DashboardLayout pageTitle="Federated Learning">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 overflow-hidden">
					{/* Left: Projects (3/5) */}
					<div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								Federated Projects
							</h2>
							<div className="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={runDemo}
									disabled={isLoading}
								>
									{isLoading ? (
										<span className="flex items-center gap-1.5">
											<span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
											Running...
										</span>
									) : (
										<>
											<PlayIcon className="size-3 mr-1" /> Run Demo
										</>
									)}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									onClick={fetchProjects}
								>
									Refresh
								</Button>
							</div>
						</div>

						<div className="flex-1 overflow-auto p-4 space-y-4">
							{/* Create Project */}
							<div className="rounded-lg border p-4 space-y-3">
								<div className="flex items-center gap-2 text-sm font-semibold">
									<PlusIcon className="size-4" /> New Project
								</div>
								<div className="grid grid-cols-2 gap-3">
									<label className="block col-span-2">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Name
										</span>
										<input
											value={newName}
											onChange={(e) => setNewName(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="block col-span-2">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Description
										</span>
										<input
											value={newDesc}
											onChange={(e) => setNewDesc(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="block">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Model Type
										</span>
										<select
											value={newModel}
											onChange={(e) => setNewModel(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										>
											{MODEL_TYPES.map((m) => (
												<option key={m.value} value={m.value}>
													{m.label}
												</option>
											))}
										</select>
									</label>
									<label className="block">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Target Variable
										</span>
										<input
											value={newTarget}
											onChange={(e) => setNewTarget(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="block col-span-2">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Features (comma-separated)
										</span>
										<input
											value={newFeatures}
											onChange={(e) => setNewFeatures(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="block">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Min Facilities
										</span>
										<input
											type="number"
											value={newMinFac}
											onChange={(e) => setNewMinFac(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
									<label className="block">
										<span className="text-xs font-medium text-muted-foreground block mb-1">
											Max Rounds
										</span>
										<input
											type="number"
											value={newMaxRounds}
											onChange={(e) => setNewMaxRounds(e.target.value)}
											className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</label>
								</div>
								<Button
									size="sm"
									className="h-8 text-xs w-full"
									onClick={createProject}
									disabled={isLoading}
								>
									Create Project
								</Button>
							</div>

							{/* Project list */}
							{projects.length > 0 && (
								<div className="space-y-2">
									<span className="text-xs font-bold uppercase text-muted-foreground">
										Projects ({projects.length})
									</span>
									{projects.map((p) => (
										<button
											key={p.project_id}
											type="button"
											onClick={() => {
												setSelectedProject(p);
												fetchMetrics(p.project_id);
											}}
											className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${selectedProject?.project_id === p.project_id ? "border-primary bg-primary/5" : ""}`}
										>
											<div className="flex items-center justify-between mb-1">
												<span className="text-sm font-semibold truncate">
													{p.name}
												</span>
												<span
													className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ""}`}
												>
													{p.status}
												</span>
											</div>
											<div className="flex items-center gap-3 text-xs text-muted-foreground">
												<span className="flex items-center gap-1">
													<LayersIcon className="size-3" />
													{p.model_type.replace(/_/g, " ")}
												</span>
												<span className="flex items-center gap-1">
													<ServerIcon className="size-3" />
													{p.facilities.length} facilities
												</span>
												<span className="flex items-center gap-1">
													<BarChart3Icon className="size-3" />
													Round {p.current_round}/{p.max_rounds}
												</span>
											</div>
										</button>
									))}
								</div>
							)}

							{projects.length === 0 && (
								<div className="text-center py-8">
									<NetworkIcon className="size-10 mx-auto text-muted-foreground/30 mb-3" />
									<p className="text-sm text-muted-foreground">
										No projects yet. Create one or click{" "}
										<strong>Run Demo</strong> to see the full workflow.
									</p>
								</div>
							)}
						</div>

						<div className="px-4 py-2.5 border-t bg-muted/30">
							<ViewCodeDialog
								endpoint={`${FL_BASE}/projects`}
								method="POST"
								body={{
									name: newName,
									model_type: newModel,
									target_variable: newTarget,
									feature_columns: newFeatures.split(",").map((s) => s.trim()),
									min_facilities: 2,
									max_rounds: 5,
								}}
								description="Create a federated learning project"
							/>
						</div>
					</div>

					{/* Right: Detail (2/5) */}
					<div className="lg:col-span-2 flex flex-col overflow-hidden">
						{selectedProject ? (
							<div className="flex-1 overflow-auto p-4 space-y-4">
								{/* Header */}
								<div className="rounded-lg border p-4">
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-sm font-bold">
											{selectedProject.name}
										</h3>
										<span
											className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedProject.status] || ""}`}
										>
											{selectedProject.status}
										</span>
									</div>
									<div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
										<div>
											<span className="block text-[10px] uppercase font-bold">
												Model
											</span>
											{selectedProject.model_type.replace(/_/g, " ")}
										</div>
										<div>
											<span className="block text-[10px] uppercase font-bold">
												Facilities
											</span>
											{selectedProject.facilities.length}
										</div>
										<div>
											<span className="block text-[10px] uppercase font-bold">
												Round
											</span>
											{selectedProject.current_round}/
											{selectedProject.max_rounds}
										</div>
									</div>
								</div>

								{/* Facilities */}
								<div>
									<span className="text-xs font-bold uppercase text-muted-foreground block mb-2">
										Enrolled Facilities
									</span>
									{selectedProject.facilities.length > 0 ? (
										<div className="space-y-1.5">
											{selectedProject.facilities.map((f, i) => (
												<div
													key={i}
													className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
												>
													<div className="flex items-center gap-2">
														<ServerIcon className="size-3 text-muted-foreground" />
														<span className="font-medium">
															{f.facility_name || f.facility_id}
														</span>
													</div>
													<span className="text-muted-foreground">
														{f.sample_count?.toLocaleString() || "?"} samples
													</span>
												</div>
											))}
										</div>
									) : (
										<p className="text-xs text-muted-foreground/60">
											No facilities enrolled yet
										</p>
									)}
								</div>

								{/* Join Facility */}
								<div className="rounded-lg border p-3 space-y-2">
									<span className="text-xs font-bold uppercase text-muted-foreground">
										Join Facility
									</span>
									<div className="grid grid-cols-3 gap-2">
										<input
											value={joinFacId}
											onChange={(e) => setJoinFacId(e.target.value)}
											placeholder="Facility ID"
											className="rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
										/>
										<input
											value={joinFacName}
											onChange={(e) => setJoinFacName(e.target.value)}
											placeholder="Name"
											className="rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
										/>
										<input
											type="number"
											value={joinSamples}
											onChange={(e) => setJoinSamples(e.target.value)}
											placeholder="Samples"
											className="rounded-md border bg-transparent px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
										/>
									</div>
									<Button
										size="sm"
										variant="outline"
										className="h-7 text-xs w-full"
										onClick={joinFacility}
									>
										<PlusIcon className="size-3 mr-1" /> Join
									</Button>
								</div>

								{/* Training Controls */}
								<div className="flex gap-2">
									<Button
										size="sm"
										className="h-8 text-xs flex-1"
										onClick={startRound}
										disabled={
											selectedProject.status !== "training" &&
											selectedProject.status !== "recruiting"
										}
									>
										<PlayIcon className="size-3 mr-1" /> Start Round
									</Button>
									{selectedProject.facilities.length > 0 &&
										selectedProject.current_round > 0 && (
											<Button
												size="sm"
												variant="outline"
												className="h-8 text-xs flex-1"
												onClick={() => {
													for (const f of selectedProject.facilities) {
														submitUpdate(
															f.facility_id,
															selectedProject.current_round
														);
													}
												}}
											>
												Submit All Updates
											</Button>
										)}
								</div>

								{/* Training Metrics */}
								{metrics.length > 0 && (
									<div>
										<span className="text-xs font-bold uppercase text-muted-foreground block mb-2">
											Training Metrics
										</span>
										<div className="rounded-lg border overflow-hidden">
											<table className="w-full text-xs">
												<thead>
													<tr className="bg-muted/30">
														<th className="px-3 py-2 text-left font-bold">
															Round
														</th>
														<th className="px-3 py-2 text-left font-bold">
															Loss
														</th>
														<th className="px-3 py-2 text-left font-bold">
															Accuracy
														</th>
														<th className="px-3 py-2 text-left font-bold">
															Status
														</th>
													</tr>
												</thead>
												<tbody>
													{metrics.map((m) => (
														<tr key={m.round} className="border-t">
															<td className="px-3 py-2 font-mono">{m.round}</td>
															<td className="px-3 py-2 font-mono">
																{m.loss.toFixed(4)}
															</td>
															<td className="px-3 py-2 font-mono">
																<span
																	className={
																		m.accuracy === maxAcc
																			? "text-green-600 dark:text-green-400 font-bold"
																			: ""
																	}
																>
																	{(m.accuracy * 100).toFixed(1)}%
																</span>
															</td>
															<td className="px-3 py-2">
																{m.status === "completed" ? (
																	<CheckCircle2Icon className="size-4 text-green-600" />
																) : (
																	<AlertCircleIcon className="size-4 text-amber-500" />
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<NetworkIcon className="size-10 mx-auto text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										Select a project or click <strong>Run Demo</strong> to see
										federated learning in action.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										Train ML models across hospitals without sharing raw patient
										data — only gradient updates are exchanged.
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.federated_learning} />
			</div>
		</DashboardLayout>
	);
}
