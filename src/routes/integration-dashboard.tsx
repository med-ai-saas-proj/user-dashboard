import { useState, useCallback, useRef } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/shadcn/button";
import { MarkdownCustom } from "@/features/pg-chat/components/MarkdownCustom";
import { toast } from "sonner";
import {
	BuildingIcon,
	Building2Icon,
	FlaskConicalIcon,
	PillIcon,
	SmileIcon,
	EyeIcon,
	HeartIcon,
	BrainIcon,
	MonitorIcon,
	ClipboardListIcon,
	DatabaseIcon,
	RadioIcon,
	RefreshCwIcon,
	FileJson2Icon,
	ClipboardPlusIcon,
	BotIcon,
	SearchIcon,
	MicIcon,
	ImageIcon,
	HeartPulseIcon,
	EyeOffIcon,
	ShieldCheckIcon,
	BookOpenIcon,
	UserRoundIcon,
	WatchIcon,
	BarChart3Icon,
	StethoscopeIcon,
	type LucideIcon,
} from "lucide-react";

// --- Types ---

interface FlowNode {
	id: string;
	type: "hospital" | "his" | "venera_api" | "output";
	label: string;
	icon: LucideIcon;
	x: number;
	y: number;
	config?: Record<string, string>;
}

interface FlowEdge {
	id: string;
	source: string;
	target: string;
}

// --- Palette items ---

const HOSPITAL_ICONS: { icon: LucideIcon; label: string }[] = [
	{ icon: BuildingIcon, label: "General Hospital" },
	{ icon: Building2Icon, label: "Private Clinic" },
	{ icon: FlaskConicalIcon, label: "Lab / Diagnostics" },
	{ icon: PillIcon, label: "Pharmacy" },
	{ icon: SmileIcon, label: "Dental Clinic" },
	{ icon: EyeIcon, label: "Eye Clinic" },
	{ icon: HeartIcon, label: "Cardiology Center" },
	{ icon: BrainIcon, label: "Neurology Center" },
];

const HIS_ICONS: { icon: LucideIcon; label: string }[] = [
	{ icon: MonitorIcon, label: "Generic HIS" },
	{ icon: ClipboardListIcon, label: "EMR System" },
	{ icon: DatabaseIcon, label: "LIS (Lab)" },
	{ icon: RadioIcon, label: "RIS (Radiology)" },
	{ icon: RefreshCwIcon, label: "HIE Gateway" },
];

const VENERA_APIS: {
	icon: LucideIcon;
	label: string;
	endpoint: string;
	requiredFields: string[];
}[] = [
	{
		icon: FileJson2Icon,
		label: "EHR Converter",
		endpoint: "ehr_converter/convert",
		requiredFields: ["ehr_data"],
	},
	{
		icon: ClipboardPlusIcon,
		label: "EHR Summary",
		endpoint: "ehr_summarize",
		requiredFields: ["ehr_data", "patient_info"],
	},
	{
		icon: PillIcon,
		label: "Rx Advisor",
		endpoint: "rx_advisor",
		requiredFields: ["ehr_data", "prescription"],
	},
	{ icon: BotIcon, label: "Chat", endpoint: "chat", requiredFields: ["input"] },
	{
		icon: SearchIcon,
		label: "AI Search",
		endpoint: "ai_search",
		requiredFields: ["query"],
	},
	{
		icon: MicIcon,
		label: "Voice Transcribe",
		endpoint: "voice_transcribe",
		requiredFields: ["audio_file"],
	},
	{
		icon: ImageIcon,
		label: "Medical Image",
		endpoint: "medical_image/describe",
		requiredFields: ["image_file"],
	},
	{
		icon: HeartPulseIcon,
		label: "Health Score",
		endpoint: "health_score/evaluate",
		requiredFields: ["ehr_data"],
	},
	{
		icon: EyeOffIcon,
		label: "Data Masking",
		endpoint: "data_masking/mask",
		requiredFields: ["fhir_bundle"],
	},
	{
		icon: ShieldCheckIcon,
		label: "BHXH Validator",
		endpoint: "bhxh_validator/validate",
		requiredFields: ["xml_data"],
	},
	{
		icon: BookOpenIcon,
		label: "Knowledge Base",
		endpoint: "knowledge_base",
		requiredFields: ["query"],
	},
	{
		icon: UserRoundIcon,
		label: "Patient History",
		endpoint: "patient/{id}/history",
		requiredFields: ["fhir_bundle"],
	},
	{
		icon: WatchIcon,
		label: "Wearable Data",
		endpoint: "patient/{id}/wearable",
		requiredFields: ["source", "data"],
	},
	{
		icon: BarChart3Icon,
		label: "Public Health Stats",
		endpoint: "public_health/statistics",
		requiredFields: ["region", "metric"],
	},
	{
		icon: StethoscopeIcon,
		label: "Symptom Checker",
		endpoint: "symptom_checker/check",
		requiredFields: ["symptoms"],
	},
];

// --- Node rendering ---

function NodeBox({
	node,
	selected,
	onSelect,
	onDragStart,
}: {
	node: FlowNode;
	selected: boolean;
	onSelect: () => void;
	onDragStart: (e: React.MouseEvent) => void;
}) {
	const borderColor = {
		hospital: "border-blue-400",
		his: "border-purple-400",
		venera_api: "border-green-400",
		output: "border-orange-400",
	}[node.type];

	const bgColor = {
		hospital: "bg-blue-50 dark:bg-blue-950/30",
		his: "bg-purple-50 dark:bg-purple-950/30",
		venera_api: "bg-green-50 dark:bg-green-950/30",
		output: "bg-orange-50 dark:bg-orange-950/30",
	}[node.type];

	const IconComponent = node.icon;

	return (
		<button
			type="button"
			className={`absolute select-none cursor-grab active:cursor-grabbing flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-shadow ${borderColor} ${bgColor} ${selected ? "ring-2 ring-primary shadow-lg" : "shadow-sm"}`}
			style={{ left: node.x, top: node.y, minWidth: 80 }}
			onMouseDown={(e) => {
				e.stopPropagation();
				onSelect();
				onDragStart(e);
			}}
		>
			<IconComponent className="size-6 text-muted-foreground" />
			<span className="text-[11px] font-medium text-center leading-tight max-w-[90px]">
				{node.label}
			</span>
		</button>
	);
}

// --- Edge rendering ---

function EdgeLine({ nodes, edge }: { nodes: FlowNode[]; edge: FlowEdge }) {
	const src = nodes.find((n) => n.id === edge.source);
	const tgt = nodes.find((n) => n.id === edge.target);
	if (!src || !tgt) return null;

	const x1 = src.x + 45;
	const y1 = src.y + 50;
	const x2 = tgt.x + 45;
	const y2 = tgt.y;

	return (
		<line
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke="currentColor"
			strokeWidth={2}
			className="text-muted-foreground/40"
			markerEnd="url(#arrowhead)"
		/>
	);
}

// --- Code generation ---

function generateIntegrationCode(
	nodes: FlowNode[],
	edges: FlowEdge[]
): { instructions: string; code: string } {
	const hospitals = nodes.filter((n) => n.type === "hospital");
	const hisSystems = nodes.filter((n) => n.type === "his");
	const apis = nodes.filter((n) => n.type === "venera_api");

	const apiMeta = (label: string) => VENERA_APIS.find((a) => a.label === label);

	let instructions = "# Integration Instructions\n\n";
	instructions += `## Facilities (${hospitals.length})\n`;
	for (const h of hospitals) {
		instructions += `- ${h.icon} ${h.label}\n`;
	}
	instructions += `\n## HIS Systems (${hisSystems.length})\n`;
	for (const h of hisSystems) {
		instructions += `- ${h.icon} ${h.label}\n`;
	}
	instructions += `\n## Venera APIs (${apis.length})\n`;
	for (const a of apis) {
		const meta = apiMeta(a.label);
		instructions += `- ${a.icon} ${a.label}: POST /service/api/v1/${meta?.endpoint ?? "?"}\n`;
		if (meta?.requiredFields) {
			instructions += `  Required fields from HIS: ${meta.requiredFields.join(", ")}\n`;
		}
	}

	instructions += "\n## Data Flow\n";
	for (const edge of edges) {
		const src = nodes.find((n) => n.id === edge.source);
		const tgt = nodes.find((n) => n.id === edge.target);
		if (src && tgt) {
			instructions += `${src.label} → ${tgt.label}\n`;
		}
	}

	instructions += "\n## Required HIS Data Mapping\n";
	instructions +=
		"The HIS system must provide the following data for each connected API:\n\n";
	for (const a of apis) {
		const meta = apiMeta(a.label);
		if (!meta) continue;
		instructions += `### ${a.label} (${meta.endpoint})\n`;
		for (const field of meta.requiredFields) {
			instructions += `- \`${field}\`: <description from HIS>\n`;
		}
		instructions += "\n";
	}

	let code =
		'import requests\n\nBASE_URL = "https://api.venera.ai/service/api/v1"\nAPI_KEY = "YOUR_API_KEY"\nheaders = {"X-Api-Key": API_KEY, "Content-Type": "application/json"}\n\n';

	for (let i = 0; i < apis.length; i++) {
		const a = apis[i];
		const meta = apiMeta(a.label);
		if (!meta) continue;
		const body: Record<string, string> = {};
		for (const f of meta.requiredFields) {
			body[f] = `"<from HIS: ${f}>"`;
		}
		code += `# Step ${i + 1}: ${a.label}\n`;
		code += `resp_${i + 1} = requests.post(\n`;
		code += `    f"{BASE_URL}/${meta.endpoint}",\n`;
		code += `    headers=headers,\n`;
		code += `    json=${JSON.stringify(body, null, 4).replace(/"/g, '"')},\n`;
		code += `)\n`;
		code += `result_${i + 1} = resp_${i + 1}.json()\n\n`;
	}

	return { instructions, code };
}

// --- Main component ---

export default function IntegrationDashboardPage() {
	const [nodes, setNodes] = useState<FlowNode[]>([]);
	const [edges, setEdges] = useState<FlowEdge[]>([]);
	const [selectedNode, setSelectedNode] = useState<string | null>(null);
	const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
	const [generatedCode, setGeneratedCode] = useState<{
		instructions: string;
		code: string;
	} | null>(null);
	const [activeOutput, setActiveOutput] = useState<"instructions" | "code">(
		"instructions"
	);
	const canvasRef = useRef<HTMLDivElement>(null);
	const dragRef = useRef<{
		nodeId: string;
		offsetX: number;
		offsetY: number;
	} | null>(null);

	const addNode = useCallback(
		(
			type: FlowNode["type"],
			icon: LucideIcon,
			label: string,
			config?: Record<string, string>
		) => {
			const id = `${type}_${Date.now()}`;
			const xBase = {
				hospital: 50,
				his: 250,
				venera_api: 450,
				output: 650,
			}[type];
			const count = nodes.filter((n) => n.type === type).length;
			setNodes((prev) => [
				...prev,
				{
					id,
					type,
					label,
					icon,
					x: xBase,
					y: 40 + count * 80,
					config,
				},
			]);
		},
		[nodes]
	);

	const handleNodeDragStart = useCallback(
		(nodeId: string, e: React.MouseEvent) => {
			const node = nodes.find((n) => n.id === nodeId);
			if (!node) return;
			dragRef.current = {
				nodeId,
				offsetX: e.clientX - node.x,
				offsetY: e.clientY - node.y,
			};
		},
		[nodes]
	);

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (!dragRef.current) return;
		const rect = canvasRef.current?.getBoundingClientRect();
		if (!rect) return;
		const x = e.clientX - dragRef.current.offsetX;
		const y = e.clientY - dragRef.current.offsetY;
		setNodes((prev) =>
			prev.map((n) =>
				n.id === dragRef.current?.nodeId
					? { ...n, x: Math.max(0, x), y: Math.max(0, y) }
					: n
			)
		);
	}, []);

	const handleMouseUp = useCallback(() => {
		dragRef.current = null;
	}, []);

	const handleConnect = useCallback(() => {
		if (!connectingFrom || !selectedNode || connectingFrom === selectedNode)
			return;
		const exists = edges.find(
			(e) => e.source === connectingFrom && e.target === selectedNode
		);
		if (exists) return;
		setEdges((prev) => [
			...prev,
			{
				id: `${connectingFrom}_${selectedNode}`,
				source: connectingFrom,
				target: selectedNode,
			},
		]);
		setConnectingFrom(null);
		toast.success("Connection added");
	}, [connectingFrom, selectedNode, edges]);

	const handleDeleteSelected = useCallback(() => {
		if (!selectedNode) return;
		setNodes((prev) => prev.filter((n) => n.id !== selectedNode));
		setEdges((prev) =>
			prev.filter((e) => e.source !== selectedNode && e.target !== selectedNode)
		);
		setSelectedNode(null);
	}, [selectedNode]);

	const handleGenerate = useCallback(() => {
		const result = generateIntegrationCode(nodes, edges);
		setGeneratedCode(result);
		toast.success("Integration code generated");
	}, [nodes, edges]);

	return (
		<DashboardLayout pageTitle="Integration Dashboard">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				<div className="flex-1 flex overflow-hidden">
					{/* Left: Palette */}
					<div className="w-56 shrink-0 border-r overflow-y-auto bg-muted/20 p-3 space-y-4">
						<div>
							<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
								Hospitals / Clinics
							</h3>
							<div className="grid grid-cols-2 gap-1.5">
								{HOSPITAL_ICONS.map((h) => {
									const IconComp = h.icon;
									return (
										<button
											key={h.label}
											type="button"
											onClick={() => addNode("hospital", h.icon, h.label)}
											className="flex flex-col items-center gap-1 p-2 rounded-md border hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-center"
										>
											<IconComp className="size-5 text-blue-500" />
											<span className="text-[11px] leading-tight">
												{h.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>

						<div>
							<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
								HIS Systems
							</h3>
							<div className="grid grid-cols-2 gap-1.5">
								{HIS_ICONS.map((h) => {
									const IconComp = h.icon;
									return (
										<button
											key={h.label}
											type="button"
											onClick={() => addNode("his", h.icon, h.label)}
											className="flex flex-col items-center gap-1 p-2 rounded-md border hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors text-center"
										>
											<IconComp className="size-5 text-purple-500" />
											<span className="text-[11px] leading-tight">
												{h.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>

						<div>
							<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
								Venera APIs
							</h3>
							<div className="grid grid-cols-2 gap-1.5">
								{VENERA_APIS.map((a) => {
									const IconComp = a.icon;
									return (
										<button
											key={a.label}
											type="button"
											onClick={() =>
												addNode("venera_api", a.icon, a.label, {
													endpoint: a.endpoint,
												})
											}
											className="flex flex-col items-center gap-1 p-2 rounded-md border hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors text-center"
										>
											<IconComp className="size-5 text-green-500" />
											<span className="text-[11px] leading-tight">
												{a.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Center: Canvas */}
					<div className="flex-1 flex flex-col overflow-hidden">
						{/* Toolbar */}
						<div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/20 flex-wrap">
							<span className="text-[11px] text-muted-foreground mr-2">
								Click palette to add → Drag to position → Select two nodes &
								Connect
							</span>
							<Button
								variant="outline"
								size="sm"
								className="h-6 text-[11px]"
								disabled={!selectedNode}
								onClick={() => {
									if (connectingFrom) {
										handleConnect();
									} else {
										setConnectingFrom(selectedNode);
										toast.info("Select target node, then click Connect again");
									}
								}}
							>
								{connectingFrom ? "Finish Connect" : "Connect"}
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-6 text-[11px]"
								disabled={!selectedNode}
								onClick={handleDeleteSelected}
							>
								Delete
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-6 text-[11px]"
								onClick={() => {
									setNodes([]);
									setEdges([]);
									setGeneratedCode(null);
									setSelectedNode(null);
								}}
							>
								Clear All
							</Button>
							<div className="ml-auto">
								<Button
									size="sm"
									className="h-7 text-xs"
									disabled={nodes.length === 0}
									onClick={handleGenerate}
								>
									Generate Integration Code
								</Button>
							</div>
						</div>

						<div className="flex-1 flex overflow-hidden">
							{/* Canvas area */}
							{/* biome-ignore lint/a11y/noStaticElementInteractions: canvas drag-and-drop area */}
							<div
								ref={canvasRef}
								className="flex-1 relative overflow-auto bg-[radial-gradient(circle,_rgba(0,0,0,0.04)_1px,_transparent_1px)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[length:20px_20px]"
								onMouseMove={handleMouseMove}
								onMouseUp={handleMouseUp}
								onMouseLeave={handleMouseUp}
							>
								<svg
									className="absolute inset-0 w-full h-full pointer-events-none"
									style={{ minWidth: 900, minHeight: 600 }}
									aria-hidden="true"
								>
									<defs>
										<marker
											id="arrowhead"
											markerWidth="8"
											markerHeight="6"
											refX="8"
											refY="3"
											orient="auto"
										>
											<path
												d="M0,0 L8,3 L0,6"
												fill="currentColor"
												className="text-muted-foreground/40"
											/>
										</marker>
									</defs>
									{edges.map((edge) => (
										<EdgeLine key={edge.id} nodes={nodes} edge={edge} />
									))}
								</svg>

								{nodes.length === 0 && (
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="text-center space-y-2">
											<p className="text-sm text-muted-foreground">
												Click items from the palette on the left to add them to
												the canvas
											</p>
											<p className="text-[11px] text-muted-foreground/60">
												Hospital → HIS → Venera API → Generate Code
											</p>
										</div>
									</div>
								)}

								{nodes.map((node) => (
									<NodeBox
										key={node.id}
										node={node}
										selected={
											selectedNode === node.id || connectingFrom === node.id
										}
										onSelect={() => {
											setSelectedNode(node.id);
											if (connectingFrom && connectingFrom !== node.id) {
												const exists = edges.find(
													(e) =>
														e.source === connectingFrom && e.target === node.id
												);
												if (!exists) {
													setEdges((prev) => [
														...prev,
														{
															id: `${connectingFrom}_${node.id}`,
															source: connectingFrom,
															target: node.id,
														},
													]);
													toast.success("Connected");
												}
												setConnectingFrom(null);
											}
										}}
										onDragStart={(e) => handleNodeDragStart(node.id, e)}
									/>
								))}
							</div>

							{/* Right: Generated output */}
							{generatedCode && (
								<div className="w-80 shrink-0 border-l flex flex-col overflow-hidden">
									<div className="flex border-b">
										{(["instructions", "code"] as const).map((tab) => (
											<button
												key={tab}
												type="button"
												onClick={() => setActiveOutput(tab)}
												className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeOutput === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
											>
												{tab === "instructions"
													? "Instructions"
													: "Python Code"}
											</button>
										))}
									</div>
									<div className="flex-1 overflow-auto p-3">
										{activeOutput === "instructions" ? (
											<MarkdownCustom content={generatedCode.instructions} />
										) : (
											<pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
												{generatedCode.code}
											</pre>
										)}
									</div>
									<div className="p-2 border-t flex gap-2">
										<Button
											variant="outline"
											size="sm"
											className="text-[11px] h-6 flex-1"
											onClick={() => {
												const text =
													activeOutput === "instructions"
														? generatedCode.instructions
														: generatedCode.code;
												navigator.clipboard.writeText(text);
												toast.success("Copied");
											}}
										>
											Copy
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="text-[11px] h-6 flex-1"
											onClick={() => {
												const text =
													activeOutput === "instructions"
														? generatedCode.instructions
														: generatedCode.code;
												const blob = new Blob([text], {
													type: "text/plain",
												});
												const url = URL.createObjectURL(blob);
												const a = document.createElement("a");
												a.href = url;
												a.download =
													activeOutput === "instructions"
														? "integration-instructions.md"
														: "integration-code.py";
												a.click();
												URL.revokeObjectURL(url);
											}}
										>
											Download
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
