import { useState, useCallback } from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/shadcn/button";
import { toast } from "sonner";
import {
	PlusIcon,
	TableIcon,
	BarChart3Icon,
	FileTextIcon,
	ListIcon,
	LayoutGridIcon,
	GripVerticalIcon,
	TrashIcon,
	DatabaseIcon,
	CopyIcon,
	DownloadIcon,
} from "lucide-react";

type WidgetType = "table" | "stat_card" | "chart" | "text" | "list" | "form";

interface DashboardWidget {
	id: string;
	type: WidgetType;
	title: string;
	w: 1 | 2 | 3;
	config: Record<string, string>;
}

interface DbTable {
	name: string;
	columns: { name: string; type: string }[];
}

const WIDGET_TEMPLATES: {
	type: WidgetType;
	label: string;
	icon: typeof TableIcon;
	defaultW: 1 | 2 | 3;
}[] = [
	{ type: "stat_card", label: "Stat Card", icon: BarChart3Icon, defaultW: 1 },
	{ type: "table", label: "Data Table", icon: TableIcon, defaultW: 3 },
	{ type: "chart", label: "Chart", icon: BarChart3Icon, defaultW: 2 },
	{ type: "text", label: "Text Block", icon: FileTextIcon, defaultW: 1 },
	{ type: "list", label: "List", icon: ListIcon, defaultW: 1 },
	{ type: "form", label: "Input Form", icon: LayoutGridIcon, defaultW: 2 },
];

const SAMPLE_DB_TABLES: DbTable[] = [
	{
		name: "patients",
		columns: [
			{ name: "id", type: "SERIAL PRIMARY KEY" },
			{ name: "first_name", type: "VARCHAR(100)" },
			{ name: "last_name", type: "VARCHAR(100)" },
			{ name: "dob", type: "DATE" },
			{ name: "gender", type: "VARCHAR(10)" },
			{ name: "mrn", type: "VARCHAR(50) UNIQUE" },
			{ name: "created_at", type: "TIMESTAMP DEFAULT NOW()" },
		],
	},
	{
		name: "encounters",
		columns: [
			{ name: "id", type: "SERIAL PRIMARY KEY" },
			{ name: "patient_id", type: "INT REFERENCES patients(id)" },
			{ name: "type", type: "VARCHAR(20)" },
			{ name: "status", type: "VARCHAR(20)" },
			{ name: "admit_date", type: "TIMESTAMP" },
			{ name: "discharge_date", type: "TIMESTAMP" },
			{ name: "department", type: "VARCHAR(100)" },
			{ name: "physician", type: "VARCHAR(200)" },
		],
	},
	{
		name: "observations",
		columns: [
			{ name: "id", type: "SERIAL PRIMARY KEY" },
			{ name: "patient_id", type: "INT REFERENCES patients(id)" },
			{ name: "encounter_id", type: "INT REFERENCES encounters(id)" },
			{ name: "code", type: "VARCHAR(20)" },
			{ name: "display", type: "VARCHAR(200)" },
			{ name: "value", type: "VARCHAR(100)" },
			{ name: "unit", type: "VARCHAR(50)" },
			{ name: "observed_at", type: "TIMESTAMP" },
		],
	},
	{
		name: "fhir_bundles",
		columns: [
			{ name: "id", type: "SERIAL PRIMARY KEY" },
			{ name: "patient_id", type: "INT REFERENCES patients(id)" },
			{ name: "bundle_type", type: "VARCHAR(50)" },
			{ name: "data", type: "JSONB" },
			{ name: "source_facility", type: "VARCHAR(200)" },
			{ name: "created_at", type: "TIMESTAMP DEFAULT NOW()" },
		],
	},
];

let widgetId = 0;

export default function DashboardBuilderPage() {
	const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
	const [activeTab, setActiveTab] = useState<"design" | "database" | "code">(
		"design"
	);
	const [dbTables, setDbTables] = useState<DbTable[]>([]);
	const [dragIdx, setDragIdx] = useState<number | null>(null);
	const [dashboardName, setDashboardName] = useState("Patient Dashboard");

	const addWidget = useCallback((type: WidgetType) => {
		const template = WIDGET_TEMPLATES.find((t) => t.type === type);
		setWidgets((prev) => [
			...prev,
			{
				id: `w_${++widgetId}`,
				type,
				title: `${template?.label || type} ${prev.length + 1}`,
				w: template?.defaultW || 1,
				config: {},
			},
		]);
	}, []);

	const removeWidget = (id: string) => {
		setWidgets((prev) => prev.filter((w) => w.id !== id));
	};

	const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
		setWidgets((prev) =>
			prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
		);
	};

	const handleDragStart = (idx: number) => setDragIdx(idx);
	const handleDragOver = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragIdx === null || dragIdx === idx) return;
		setWidgets((prev) => {
			const copy = [...prev];
			const [moved] = copy.splice(dragIdx, 1);
			copy.splice(idx, 0, moved);
			return copy;
		});
		setDragIdx(idx);
	};
	const handleDragEnd = () => setDragIdx(null);

	const loadSampleSchema = () => {
		setDbTables(SAMPLE_DB_TABLES);
		toast.success("Sample database schema loaded");
	};

	const generateCode = () => {
		const reactCode = `// Auto-generated Dashboard: ${dashboardName}
// Integrates with Venera Flow Builder API
import React from "react";

${widgets
	.map((w, i) => {
		switch (w.type) {
			case "stat_card":
				return `function StatCard${i}() {\n  return (\n    <div className="rounded-lg border p-4">\n      <p className="text-sm text-muted-foreground">${w.title}</p>\n      <p className="text-2xl font-bold">--</p>\n    </div>\n  );\n}`;
			case "table":
				return `function DataTable${i}() {\n  const [data, setData] = React.useState([]);\n  React.useEffect(() => {\n    fetch("/service/api/v1/patient")\n      .then(r => r.json())\n      .then(setData);\n  }, []);\n  return (\n    <table className="w-full text-sm">\n      <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>\n      <tbody>{data.map(r => <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.status}</td></tr>)}</tbody>\n    </table>\n  );\n}`;
			case "chart":
				return `function Chart${i}() {\n  return <div className="rounded-lg border p-4 h-48 flex items-center justify-center text-muted-foreground">${w.title} (chart placeholder)</div>;\n}`;
			default:
				return `function Widget${i}() {\n  return <div className="rounded-lg border p-4">${w.title}</div>;\n}`;
		}
	})
	.join("\n\n")}

export default function ${dashboardName.replace(/\s+/g, "")}() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">${dashboardName}</h1>
      <div className="grid grid-cols-3 gap-4">
        ${widgets.map((_, i) => `{/* ${widgets[i].title} */}\n        <div className="col-span-${widgets[i].w}"><${widgets[i].type === "stat_card" ? `StatCard${i}` : widgets[i].type === "table" ? `DataTable${i}` : widgets[i].type === "chart" ? `Chart${i}` : `Widget${i}`} /></div>`).join("\n        ")}
      </div>
    </div>
  );
}`;

		const sqlCode =
			dbTables.length > 0
				? `-- Database schema for ${dashboardName}\n\n${dbTables.map((t) => `CREATE TABLE IF NOT EXISTS ${t.name} (\n${t.columns.map((c) => `  ${c.name} ${c.type}`).join(",\n")}\n);`).join("\n\n")}`
				: "-- No database tables defined yet. Load sample schema or add tables.";

		return { react: reactCode, sql: sqlCode };
	};

	const code = generateCode();

	return (
		<DashboardLayout pageTitle="Dashboard Builder">
			<div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
				{/* Toolbar */}
				<div className="flex items-center gap-3 px-4 py-2 border-b bg-muted/20 flex-wrap">
					<input
						value={dashboardName}
						onChange={(e) => setDashboardName(e.target.value)}
						className="text-sm font-semibold bg-transparent border-b border-transparent focus:border-primary focus:outline-none px-1"
					/>
					<div className="flex gap-1 ml-auto">
						{(["design", "database", "code"] as const).map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
							>
								{tab === "design"
									? "Design"
									: tab === "database"
										? "Database"
										: "Generated Code"}
							</button>
						))}
					</div>
				</div>

				<div className="flex-1 flex overflow-hidden">
					{activeTab === "design" && (
						<>
							{/* Widget palette */}
							<div className="w-48 shrink-0 border-r overflow-y-auto bg-muted/10 p-3 space-y-2">
								<h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
									Widgets
								</h3>
								{WIDGET_TEMPLATES.map((t) => {
									const Icon = t.icon;
									return (
										<button
											key={t.type}
											type="button"
											onClick={() => addWidget(t.type)}
											className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs hover:bg-muted/50 transition-colors"
										>
											<Icon className="size-4 text-muted-foreground" />
											<span>{t.label}</span>
										</button>
									);
								})}
								<div className="border-t pt-2 mt-3">
									<p className="text-[10px] text-muted-foreground mb-2">
										Compatible with:
									</p>
									<div className="space-y-1 text-[10px] text-muted-foreground">
										<p>- Flow Builder pipelines</p>
										<p>- MedPlum FHIR server</p>
										<p>- n8n workflow engine</p>
										<p>- Any REST API</p>
									</div>
								</div>
							</div>

							{/* Canvas */}
							<div className="flex-1 overflow-auto p-6">
								{widgets.length === 0 ? (
									<div className="flex items-center justify-center h-full">
										<div className="text-center space-y-2">
											<p className="text-sm text-muted-foreground">
												Drag widgets from the left to build your dashboard
											</p>
											<p className="text-[11px] text-muted-foreground/60">
												Widgets can connect to Flow Builder pipelines and
												database tables
											</p>
										</div>
									</div>
								) : (
									<div className="grid grid-cols-3 gap-4">
										{widgets.map((w, idx) => {
											const Icon =
												WIDGET_TEMPLATES.find((t) => t.type === w.type)?.icon ||
												LayoutGridIcon;
											return (
												// biome-ignore lint/a11y/useSemanticElements: draggable div for reordering
												<div
													key={w.id}
													role="group"
													draggable
													onDragStart={() => handleDragStart(idx)}
													onDragOver={(e) => handleDragOver(e, idx)}
													onDragEnd={handleDragEnd}
													className={`col-span-${w.w} rounded-lg border-2 border-dashed p-4 transition-colors ${dragIdx === idx ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/40"}`}
												>
													<div className="flex items-center gap-2 mb-2">
														<GripVerticalIcon className="size-4 text-muted-foreground/50 cursor-grab" />
														<Icon className="size-4 text-muted-foreground" />
														<input
															value={w.title}
															onChange={(e) =>
																updateWidget(w.id, { title: e.target.value })
															}
															className="flex-1 text-xs font-medium bg-transparent border-b border-transparent focus:border-primary focus:outline-none"
														/>
														<select
															value={w.w}
															onChange={(e) =>
																updateWidget(w.id, {
																	w: Number(e.target.value) as 1 | 2 | 3,
																})
															}
															className="text-[10px] border rounded px-1 py-0.5 bg-transparent"
														>
															<option value={1}>1/3</option>
															<option value={2}>2/3</option>
															<option value={3}>Full</option>
														</select>
														<button
															type="button"
															onClick={() => removeWidget(w.id)}
															className="text-destructive/60 hover:text-destructive"
														>
															<TrashIcon className="size-3.5" />
														</button>
													</div>
													<div className="min-h-[60px] rounded bg-muted/30 flex items-center justify-center text-[11px] text-muted-foreground">
														{w.type === "stat_card" && "0"}
														{w.type === "table" && "Table preview"}
														{w.type === "chart" && "Chart preview"}
														{w.type === "text" && "Text content"}
														{w.type === "list" && "List items"}
														{w.type === "form" && "Form fields"}
													</div>
													<div className="mt-2">
														<input
															value={w.config.dataSource || ""}
															onChange={(e) =>
																updateWidget(w.id, {
																	config: {
																		...w.config,
																		dataSource: e.target.value,
																	},
																})
															}
															placeholder="Data source (API endpoint or table)"
															className="w-full text-[10px] px-2 py-1 rounded border bg-transparent font-mono"
														/>
													</div>
												</div>
											);
										})}
										<button
											type="button"
											onClick={() => addWidget("stat_card")}
											className="col-span-1 rounded-lg border-2 border-dashed border-muted-foreground/10 p-4 flex items-center justify-center hover:border-muted-foreground/30 transition-colors"
										>
											<PlusIcon className="size-5 text-muted-foreground/30" />
										</button>
									</div>
								)}
							</div>
						</>
					)}

					{activeTab === "database" && (
						<div className="flex-1 overflow-auto p-6 space-y-4">
							<div className="flex items-center gap-3">
								<DatabaseIcon className="size-5 text-muted-foreground" />
								<h2 className="text-sm font-semibold">Database Schema</h2>
								<Button
									variant="outline"
									size="sm"
									className="h-7 text-xs ml-auto"
									onClick={loadSampleSchema}
								>
									Load Healthcare Schema
								</Button>
							</div>
							{dbTables.length === 0 ? (
								<div className="text-center py-12">
									<p className="text-sm text-muted-foreground">
										No database tables defined.
									</p>
									<p className="text-[11px] text-muted-foreground/60 mt-1">
										Load the sample healthcare schema to get started.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									{dbTables.map((table) => (
										<div key={table.name} className="rounded-lg border p-4">
											<h3 className="text-xs font-bold font-mono mb-2">
												{table.name}
											</h3>
											<div className="space-y-0.5">
												{table.columns.map((col) => (
													<div
														key={col.name}
														className="flex items-center gap-2 text-[11px]"
													>
														<span className="font-mono font-medium w-28 shrink-0">
															{col.name}
														</span>
														<span className="text-muted-foreground font-mono">
															{col.type}
														</span>
													</div>
												))}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === "code" && (
						<div className="flex-1 flex flex-col overflow-hidden">
							<div className="flex border-b">
								<span className="px-4 py-2 text-xs font-medium border-b-2 border-primary text-primary">
									React + SQL
								</span>
							</div>
							<div className="flex-1 overflow-auto p-4 space-y-4">
								<div>
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-xs font-semibold">React Component</h3>
										<div className="flex gap-1.5">
											<Button
												variant="ghost"
												size="sm"
												className="h-6 text-[11px]"
												onClick={() => {
													navigator.clipboard.writeText(code.react);
													toast.success("Copied");
												}}
											>
												<CopyIcon className="size-3 mr-1" /> Copy
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-6 text-[11px]"
												onClick={() => {
													const blob = new Blob([code.react], {
														type: "text/plain",
													});
													const a = document.createElement("a");
													a.href = URL.createObjectURL(blob);
													a.download = `${dashboardName.replace(/\s+/g, "-").toLowerCase()}.tsx`;
													a.click();
												}}
											>
												<DownloadIcon className="size-3 mr-1" /> Download
											</Button>
										</div>
									</div>
									<pre className="p-3 bg-muted/50 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
										{code.react}
									</pre>
								</div>
								<div>
									<div className="flex items-center justify-between mb-2">
										<h3 className="text-xs font-semibold">SQL Schema</h3>
										<Button
											variant="ghost"
											size="sm"
											className="h-6 text-[11px]"
											onClick={() => {
												navigator.clipboard.writeText(code.sql);
												toast.success("Copied");
											}}
										>
											<CopyIcon className="size-3 mr-1" /> Copy
										</Button>
									</div>
									<pre className="p-3 bg-muted/50 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
										{code.sql}
									</pre>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
}
