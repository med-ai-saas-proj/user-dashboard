/**
 * A2UI React Renderer — renders A2UI JSON surfaces using shadcn/Tailwind components.
 * Based on https://github.com/google/A2UI
 *
 * Maps A2UI component types to React elements:
 * - Column/Row → flex containers
 * - Text → styled text with usage hints
 * - Button → shadcn Button
 * - TextField → input/textarea
 * - Card → bordered container
 * - Divider → hr
 * - Icon → lucide icons
 * - CheckBox → checkbox input
 * - Tabs → tab interface
 */

import { Button } from "@/components/shadcn/button";

interface A2UIComponentDef {
	id: string;
	component: Record<string, Record<string, unknown>>;
	weight?: number;
}

interface A2UISurface {
	surfaceId: string;
	components: A2UIComponentDef[];
	dataModel?: Record<string, unknown>;
}

interface A2UIRendererProps {
	surface: A2UISurface;
	onAction?: (actionName: string, data?: Record<string, unknown>) => void;
	className?: string;
}

function resolveText(val: unknown): string {
	if (!val) return "";
	if (typeof val === "string") return val;
	if (typeof val === "object" && val !== null) {
		const obj = val as Record<string, unknown>;
		if ("literalString" in obj) return String(obj.literalString);
		if ("path" in obj) return String(obj.path);
	}
	return String(val);
}

function resolveChildren(children: unknown): string[] {
	if (!children) return [];
	if (typeof children === "object" && children !== null) {
		const obj = children as Record<string, unknown>;
		if ("explicitList" in obj && Array.isArray(obj.explicitList))
			return obj.explicitList as string[];
	}
	if (Array.isArray(children)) return children as string[];
	return [];
}

const USAGE_STYLES: Record<string, string> = {
	h1: "text-2xl font-bold",
	h2: "text-xl font-bold",
	h3: "text-lg font-semibold",
	h4: "text-sm font-semibold",
	h5: "text-xs font-semibold",
	caption: "text-xs text-muted-foreground",
	body: "text-sm",
};

function RenderComponent({
	def,
	componentMap,
	onAction,
}: {
	def: A2UIComponentDef;
	componentMap: Map<string, A2UIComponentDef>;
	onAction?: (name: string) => void;
}) {
	const [typeName, props] = Object.entries(def.component)[0] || [];
	if (!typeName || !props) return null;

	switch (typeName) {
		case "Text": {
			const text = resolveText(props.text);
			const hint = String(props.usageHint || "body");
			return <p className={USAGE_STYLES[hint] || "text-sm"}>{text}</p>;
		}

		case "Column": {
			const children = resolveChildren(props.children);
			return (
				<div className="flex flex-col gap-3">
					{children.map((childId) => {
						const child = componentMap.get(childId);
						if (!child) return null;
						return (
							<RenderComponent
								key={childId}
								def={child}
								componentMap={componentMap}
								onAction={onAction}
							/>
						);
					})}
				</div>
			);
		}

		case "Row": {
			const children = resolveChildren(props.children);
			const dist = String(props.distribution || "start");
			const justifyMap: Record<string, string> = {
				start: "justify-start",
				center: "justify-center",
				end: "justify-end",
				spaceBetween: "justify-between",
				spaceAround: "justify-around",
				spaceEvenly: "justify-evenly",
			};
			return (
				<div
					className={`flex flex-wrap gap-2 items-center ${justifyMap[dist] || ""}`}
				>
					{children.map((childId) => {
						const child = componentMap.get(childId);
						if (!child) return null;
						return (
							<RenderComponent
								key={childId}
								def={child}
								componentMap={componentMap}
								onAction={onAction}
							/>
						);
					})}
				</div>
			);
		}

		case "Button": {
			const childId = String(props.child || "");
			const childDef = componentMap.get(childId);
			const label = childDef
				? resolveText(
						(Object.values(childDef.component)[0] as Record<string, unknown>)
							?.text
					)
				: "Button";
			const primary = Boolean(props.primary);
			const actionName =
				((props.action as Record<string, unknown>)?.name as string) || "";
			return (
				<Button
					size="sm"
					variant={primary ? "default" : "outline"}
					className="text-xs"
					onClick={() => onAction?.(actionName)}
				>
					{label}
				</Button>
			);
		}

		case "TextField": {
			const label = resolveText(props.label);
			const fieldType = String(props.textFieldType || "shortText");
			if (fieldType === "longText") {
				return (
					<label className="block space-y-1">
						<span className="text-xs font-medium text-muted-foreground">
							{label}
						</span>
						<textarea
							className="w-full rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
							rows={3}
							placeholder={label}
						/>
					</label>
				);
			}
			return (
				<label className="block space-y-1">
					<span className="text-xs font-medium text-muted-foreground">
						{label}
					</span>
					<input
						type={
							fieldType === "number"
								? "number"
								: fieldType === "date"
									? "date"
									: fieldType === "obscured"
										? "password"
										: "text"
						}
						className="w-full rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
						placeholder={label}
					/>
				</label>
			);
		}

		case "Card": {
			const childId = String(props.child || "");
			const child = componentMap.get(childId);
			return (
				<div className="rounded-xl border bg-card p-4">
					{child && (
						<RenderComponent
							def={child}
							componentMap={componentMap}
							onAction={onAction}
						/>
					)}
				</div>
			);
		}

		case "Divider":
			return <hr className="border-muted" />;

		case "CheckBox": {
			const label = resolveText(props.label);
			return (
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" className="rounded border" />
					{label}
				</label>
			);
		}

		case "Icon": {
			const name = resolveText(props.name);
			return <span className="text-muted-foreground text-sm">[{name}]</span>;
		}

		case "Tabs": {
			const items =
				(props.tabItems as Array<{ title: unknown; child: string }>) || [];
			return (
				<div className="space-y-2">
					<div className="flex gap-1 border-b">
						{items.map((tab, i) => (
							<button
								key={String(tab.child)}
								type="button"
								className={`px-3 py-1.5 text-xs font-medium border-b-2 ${i === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
							>
								{resolveText(tab.title)}
							</button>
						))}
					</div>
					{items[0] &&
						(() => {
							const child = componentMap.get(items[0].child);
							return child ? (
								<RenderComponent
									def={child}
									componentMap={componentMap}
									onAction={onAction}
								/>
							) : null;
						})()}
				</div>
			);
		}

		default:
			return (
				<div className="text-xs text-muted-foreground/50 p-1 border border-dashed rounded">
					[{typeName}]
				</div>
			);
	}
}

export function A2UIRenderer({
	surface,
	onAction,
	className = "",
}: A2UIRendererProps) {
	const componentMap = new Map<string, A2UIComponentDef>();
	for (const comp of surface.components) {
		componentMap.set(comp.id, comp);
	}

	const root = componentMap.get("root");
	if (!root) {
		return (
			<div className="text-sm text-muted-foreground">
				No root component found
			</div>
		);
	}

	return (
		<div className={className}>
			<RenderComponent
				def={root}
				componentMap={componentMap}
				onAction={onAction}
			/>
		</div>
	);
}

export type { A2UISurface, A2UIComponentDef };
