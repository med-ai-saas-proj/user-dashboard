import { useState, useEffect } from "react";
import { BASE_API_URL } from "@/config/api-routes";
import { ApiKeyRequiredDialog } from "@/features/api-keys/components/api-key-required-dialog";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { Button } from "@/components/shadcn/button";
import { ViewCodeDialog } from "@/components/view-code-dialog";
import DashboardLayout from "@/layouts/dashboard-layout";
import { getAuthHeaders } from "@/lib/auth-headers";
import { ApiTopology, TOPOLOGIES } from "@/components/api-topology";
import { A2UIRenderer } from "@/components/a2ui-renderer";
import type { A2UISurface } from "@/components/a2ui-renderer";
import { toast } from "sonner";
import { LayoutDashboardIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";

const A2UI_ENDPOINT = `${BASE_API_URL}service/api/v1/a2ui`;

interface DemoInfo {
	name: string;
	description: string;
	steps: number;
}

interface GenerateResult {
	workflow_name: string;
	surface: A2UISurface;
	embed_code: string;
	his_integration_notes: string;
}

export default function A2UIPlaygroundPage() {
	const [demos, setDemos] = useState<Record<string, DemoInfo>>({});
	const [selectedDemo, setSelectedDemo] = useState<string>("");
	const [result, setResult] = useState<GenerateResult | null>(null);
	const [, setIsLoading] = useState(false);
	const [viewTab, setViewTab] = useState<"preview" | "json" | "embed" | "his">(
		"preview"
	);
	const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
	const { selectedApiKey } = useServiceApiKeyStore();

	useEffect(() => {
		(async () => {
			try {
				const resp = await fetch(`${A2UI_ENDPOINT}/demos`);
				if (resp.ok) setDemos(await resp.json());
			} catch {
				/* backend unreachable */
			}
		})();
	}, []);

	const handleGenerate = async (demoId: string) => {
		if (!selectedApiKey) {
			setShowApiKeyDialog(true);
			return;
		}
		setIsLoading(true);
		setResult(null);
		try {
			const headers = await getAuthHeaders(
				`${A2UI_ENDPOINT}/generate-demo/${demoId}`
			);
			const resp = await fetch(`${A2UI_ENDPOINT}/generate-demo/${demoId}`, {
				method: "POST",
				headers,
			});
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			const data: GenerateResult = await resp.json();
			setResult(data);
			setViewTab("preview");
			toast.success(`Generated UI: ${data.workflow_name}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DashboardLayout pageTitle="A2UI — Generate UI from APIs">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 overflow-hidden">
					{/* Left panel: demo selector */}
					<div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								API → UI Generator
							</h2>
						</div>

						<div className="flex-1 overflow-auto p-4 space-y-4">
							<div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-2">
								<div className="flex items-center gap-2">
									<LayoutDashboardIcon className="size-5 text-primary" />
									<h3 className="text-sm font-bold">
										A2UI: Agent-to-User Interface
									</h3>
								</div>
								<p className="text-xs text-muted-foreground">
									Turn any API workflow into a rich, interactive UI that can be
									embedded in HIS/EHR systems. Based on{" "}
									<a
										href="https://github.com/google/A2UI"
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary underline"
									>
										Google's A2UI
									</a>{" "}
									open standard.
								</p>
								<div className="flex flex-wrap gap-1.5 text-[10px]">
									<span className="px-2 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
										Declarative JSON
									</span>
									<span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
										Framework-agnostic
									</span>
									<span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
										Secure by design
									</span>
									<span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
										HIS-embeddable
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<span className="text-xs font-bold uppercase text-muted-foreground">
									Demo Workflows
								</span>
								{Object.entries(demos).map(([id, info]) => (
									<button
										key={id}
										type="button"
										onClick={() => {
											setSelectedDemo(id);
											handleGenerate(id);
										}}
										className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${selectedDemo === id ? "border-primary bg-primary/5" : ""}`}
									>
										<div className="text-xs font-semibold">{info.name}</div>
										<div className="text-[10px] text-muted-foreground mt-0.5">
											{info.description}
										</div>
										<div className="text-[10px] text-muted-foreground/60 mt-1">
											{info.steps} API steps
										</div>
									</button>
								))}
								{Object.keys(demos).length === 0 && (
									<p className="text-xs text-muted-foreground/50">
										Loading demos...
									</p>
								)}
							</div>

							<div className="rounded-lg border p-3 space-y-2">
								<span className="text-xs font-bold uppercase text-muted-foreground">
									How it works
								</span>
								<ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
									<li>Select a workflow (or build one in Flow Builder)</li>
									<li>API generates A2UI JSON — a declarative UI surface</li>
									<li>
										Client renders using native components (React, Flutter,
										Angular)
									</li>
									<li>
										Embed in HIS systems via iframe, web component, or REST API
									</li>
								</ol>
							</div>
						</div>

						<div className="px-4 py-2.5 border-t bg-muted/30">
							<ViewCodeDialog
								endpoint={`${A2UI_ENDPOINT}/generate`}
								method="POST"
								body={{
									workflow_name: "EHR → Summary",
									steps: [
										{
											api_id: "ehr_convert",
											label: "EHR Converter",
											endpoint: "/ehr_converter/convert",
											method: "POST",
										},
									],
									target_system: "his",
									style: "dashboard",
								}}
								description="Generate A2UI surface from API workflow"
							/>
						</div>
					</div>

					{/* Right panel: preview */}
					<div className="lg:col-span-3 flex flex-col overflow-hidden">
						{result ? (
							<>
								<div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 flex-wrap">
									{(["preview", "json", "embed", "his"] as const).map((tab) => (
										<button
											key={tab}
											type="button"
											onClick={() => setViewTab(tab)}
											className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
										>
											{tab === "preview"
												? "Live Preview"
												: tab === "json"
													? "A2UI JSON"
													: tab === "embed"
														? "Embed Code"
														: "HIS Integration"}
										</button>
									))}
								</div>

								<div className="flex-1 overflow-auto p-4">
									{viewTab === "preview" && (
										<div className="max-w-2xl mx-auto">
											<A2UIRenderer
												surface={result.surface}
												onAction={(action) => toast.info(`Action: ${action}`)}
												className="space-y-3"
											/>
										</div>
									)}
									{viewTab === "json" && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="text-xs font-bold text-muted-foreground">
													{result.surface.components.length} components
												</span>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 text-[10px]"
													onClick={() => {
														navigator.clipboard.writeText(
															JSON.stringify(result.surface, null, 2)
														);
														toast.success("Copied");
													}}
												>
													<CopyIcon className="size-3 mr-1" /> Copy JSON
												</Button>
											</div>
											<pre className="text-[11px] font-mono bg-muted/30 rounded-lg p-4 overflow-auto max-h-[60vh] whitespace-pre-wrap">
												{JSON.stringify(result.surface, null, 2)}
											</pre>
										</div>
									)}
									{viewTab === "embed" && (
										<div className="space-y-4 max-w-2xl">
											<div>
												<h3 className="text-sm font-semibold mb-2">
													Embed Code
												</h3>
												<pre className="text-[11px] font-mono bg-muted/30 rounded-lg p-4 whitespace-pre-wrap">
													{result.embed_code}
												</pre>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="text-xs"
												onClick={() => {
													navigator.clipboard.writeText(result.embed_code);
													toast.success("Copied embed code");
												}}
											>
												<CopyIcon className="size-3 mr-1" /> Copy
											</Button>
										</div>
									)}
									{viewTab === "his" && (
										<div className="max-w-2xl prose prose-sm dark:prose-invert">
											<pre className="text-[11px] font-mono whitespace-pre-wrap bg-muted/30 rounded-lg p-4">
												{result.his_integration_notes}
											</pre>
										</div>
									)}
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center p-8">
								<div className="text-center space-y-3 max-w-sm">
									<LayoutDashboardIcon className="size-10 mx-auto text-muted-foreground/30" />
									<p className="text-sm text-muted-foreground">
										Select a demo workflow or build your own in the{" "}
										<strong>Flow Builder</strong> to generate an A2UI surface.
									</p>
									<p className="text-[11px] text-muted-foreground/60">
										A2UI turns API workflows into embeddable UIs for HIS/EHR
										systems — no frontend coding required.
									</p>
									<a
										href="https://github.com/google/A2UI"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
									>
										<ExternalLinkIcon className="size-3" /> Learn more about
										A2UI
									</a>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="px-4 py-2 border-t">
					<ApiTopology {...TOPOLOGIES.a2ui} />
				</div>
			</div>

			<ApiKeyRequiredDialog
				open={showApiKeyDialog}
				onOpenChange={setShowApiKeyDialog}
			/>
		</DashboardLayout>
	);
}
