import { DatabaseIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { DemoEmptyState } from "@/components/demo";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import { API_ROUTES } from "@/config/api-routes";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";

interface KnowledgeBase {
	id: string;
	name: string;
	type?: string;
	description?: string;
	record_count?: number;
	created_at?: string;
}

interface SearchResult {
	kb_id: string;
	kb_name: string;
	score: number;
	content: string;
	metadata?: Record<string, unknown>;
}

const KnowledgeBasePage = () => {
	const [isLoading, setIsLoading] = useState(false);

	const [bases, setBases] = useState<KnowledgeBase[]>([]);
	const [selected, setSelected] = useState<KnowledgeBase | null>(null);
	const [newName, setNewName] = useState("");
	const [newType, setNewType] = useState("custom");
	const [newDescription, setNewDescription] = useState("");

	const [ingestData, setIngestData] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

	const fetchBases = async () => {
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.KNOWLEDGE_BASE);
			const resp = await fetch(API_ROUTES.SERVICES.KNOWLEDGE_BASE, { headers });
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();
			setBases(
				Array.isArray(json) ? json : (json.knowledge_bases ?? json.data ?? [])
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to fetch");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreate = async () => {
		if (!newName.trim()) return;
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.KNOWLEDGE_BASE);
			const resp = await fetch(API_ROUTES.SERVICES.KNOWLEDGE_BASE, {
				method: "POST",
				headers,
				body: JSON.stringify({
					name: newName.trim(),
					type: newType,
					description: newDescription.trim(),
				}),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			toast.success(`Created knowledge base "${newName.trim()}"`);
			setNewName("");
			setNewType("custom");
			setNewDescription("");
			await fetchBases();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Create failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.KNOWLEDGE_BASE);
			const resp = await fetch(`${API_ROUTES.SERVICES.KNOWLEDGE_BASE}/${id}`, {
				method: "DELETE",
				headers,
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			toast.success("Knowledge base deleted");
			if (selected?.id === id) setSelected(null);
			await fetchBases();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Delete failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleIngest = async () => {
		if (!selected) return;
		setIsLoading(true);
		try {
			let records: unknown;
			try {
				records = JSON.parse(ingestData);
			} catch {
				toast.error("Invalid JSON");
				setIsLoading(false);
				return;
			}
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.KNOWLEDGE_BASE);
			const resp = await fetch(
				`${API_ROUTES.SERVICES.KNOWLEDGE_BASE}/${selected.id}/ingest`,
				{
					method: "POST",
					headers,
					body: JSON.stringify({ records }),
				}
			);
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();
			toast.success(`Ingested ${json.ingested ?? "?"} records`);
			setIngestData("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Ingest failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!selected || !searchQuery.trim()) return;
		setIsLoading(true);
		try {
			const headers = await getAuthHeaders(API_ROUTES.SERVICES.KNOWLEDGE_BASE);
			const resp = await fetch(`${API_ROUTES.SERVICES.KNOWLEDGE_BASE}/search`, {
				method: "POST",
				headers,
				body: JSON.stringify({
					query: searchQuery.trim(),
					kb_ids: [selected.id],
				}),
			});
			if (!resp.ok)
				throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
			const json = await resp.json();
			setSearchResults(
				Array.isArray(json) ? json : (json.results ?? json.data ?? [])
			);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Search failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="Knowledge Base">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex items-center justify-end px-4 py-1.5 border-b">
					<ViewCodeDialog
						endpoint={API_ROUTES.SERVICES.KNOWLEDGE_BASE}
						description="Knowledge Base: create, ingest records, and semantic search"
						steps={[
							{
								label: "Create KB",
								endpoint: API_ROUTES.SERVICES.KNOWLEDGE_BASE,
								method: "POST",
								body: { name: "My KB", type: "custom", description: "..." },
							},
							{
								label: "Ingest records",
								endpoint: `${API_ROUTES.SERVICES.KNOWLEDGE_BASE}/{kb_id}/ingest`,
								method: "POST",
								body: { records: [{ text: "..." }] },
							},
							{
								label: "Search",
								endpoint: `${API_ROUTES.SERVICES.KNOWLEDGE_BASE}/search`,
								method: "POST",
								body: { query: "search query", kb_ids: ["kb_id"] },
							},
						]}
					/>
				</div>
				<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
					{/* Left: List & Create */}
					<div className="border-r flex flex-col overflow-hidden">
						<div className="p-4 border-b space-y-3">
							<span className="text-sm font-medium">Create Knowledge Base</span>
							<input
								type="text"
								placeholder="Name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="w-full rounded-md border px-3 py-2 text-sm bg-background"
							/>
							<select
								value={newType}
								onChange={(e) => setNewType(e.target.value)}
								className="w-full rounded-md border px-3 py-2 text-sm bg-background"
							>
								<option value="custom">Custom</option>
								<option value="openfda_adverse_events">
									OpenFDA Adverse Events
								</option>
								<option value="doctor_directory">Doctor Directory</option>
								<option value="clinic_locations">Clinic Locations</option>
							</select>
							<input
								type="text"
								placeholder="Description (optional)"
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								className="w-full rounded-md border px-3 py-2 text-sm bg-background"
							/>
							<div className="flex gap-2">
								<Button
									type="button"
									onClick={handleCreate}
									disabled={isLoading || !newName.trim()}
									size="sm"
								>
									Create
								</Button>
								<Button
									type="button"
									onClick={fetchBases}
									disabled={isLoading}
									variant="outline"
									size="sm"
								>
									Refresh List
								</Button>
							</div>
						</div>
						<div className="flex-1 overflow-y-auto p-4 space-y-2">
							{bases.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-8">
									No knowledge bases yet. Click Refresh or create one above.
								</p>
							) : (
								bases.map((kb) => (
									<div
										key={kb.id}
										className={`p-3 rounded-md border cursor-pointer text-sm transition-colors ${
											selected?.id === kb.id
												? "border-primary bg-primary/5"
												: "hover:bg-muted/50"
										}`}
									>
										<button
											type="button"
											className="w-full text-left"
											onClick={() => setSelected(kb)}
										>
											<div className="font-medium">{kb.name}</div>
											{kb.description && (
												<div className="text-muted-foreground text-xs mt-1">
													{kb.description}
												</div>
											)}
											{kb.record_count != null && (
												<div className="text-muted-foreground text-xs mt-1">
													{kb.record_count} records
												</div>
											)}
										</button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="mt-2 text-destructive hover:text-destructive"
											onClick={() => handleDelete(kb.id)}
										>
											Delete
										</Button>
									</div>
								))
							)}
						</div>
					</div>

					{/* Right: Details, Ingest, Search */}
					<div className="flex flex-col overflow-hidden">
						{selected ? (
							<div className="flex-1 overflow-y-auto p-4 space-y-6">
								<div>
									<span className="text-sm font-medium">
										Selected: {selected.name}
									</span>
									<p className="text-xs text-muted-foreground mt-1">
										ID: {selected.id}
									</p>
								</div>

								<div className="space-y-2">
									<span className="text-sm font-medium">Ingest Records</span>
									<textarea
										value={ingestData}
										onChange={(e) => setIngestData(e.target.value)}
										placeholder='Paste JSON records array, e.g. [{"text": "..."}]'
										className="w-full h-32 rounded-md border px-3 py-2 text-xs font-mono bg-background resize-none"
									/>
									<Button
										type="button"
										onClick={handleIngest}
										disabled={isLoading || !ingestData.trim()}
										size="sm"
									>
										Ingest
									</Button>
								</div>

								<div className="space-y-2">
									<span className="text-sm font-medium">Search</span>
									<div className="flex gap-2">
										<input
											type="text"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											placeholder="Search query..."
											className="flex-1 rounded-md border px-3 py-2 text-sm bg-background"
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSearch();
											}}
										/>
										<Button
											type="button"
											onClick={handleSearch}
											disabled={isLoading || !searchQuery.trim()}
											size="sm"
										>
											Search
										</Button>
									</div>
									{searchResults.length > 0 && (
										<div className="space-y-2 mt-3">
											{searchResults.map((r, i) => (
												<div
													key={r.kb_id ?? i}
													className="p-3 rounded-md border text-xs"
												>
													<div className="flex justify-between mb-1">
														<span className="font-medium">Result #{i + 1}</span>
														<span className="text-muted-foreground">
															Score: {r.score?.toFixed(3)}
														</span>
													</div>
													<p className="whitespace-pre-wrap">{r.content}</p>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						) : (
							<DemoEmptyState
								icon={DatabaseIcon}
								description="Select a knowledge base from the left or create a new one."
							/>
						)}
					</div>
				</div>
			</div>

			<div className="px-4 py-2 border-t">
				<ApiTopology {...TOPOLOGIES.knowledge_base} />
			</div>
		</DashboardLayout>
	);
};

export default KnowledgeBasePage;
