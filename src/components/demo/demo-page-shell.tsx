import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DemoPageShell — the canonical wrapper for playground demo pages.
 *
 * Owns:
 *   - Full-height container that respects the 4rem (64px) dashboard header.
 *   - Vertical layout with overflow control.
 *
 * Use this as the immediate child of <DashboardLayout> for any demo page that
 * follows the input-on-left / output-on-right pattern. It guarantees consistent
 * page chrome height across BHXH validator, EHR converter, medical image, etc.
 */
export function DemoPageShell({
	children,
	className,
}: PropsWithChildren<{ className?: string }>) {
	return (
		<div
			className={cn(
				"flex flex-col h-[calc(100vh-4rem)] overflow-hidden",
				className
			)}
		>
			{children}
		</div>
	);
}

/**
 * DemoPageDescription — the muted strip directly below the dashboard header
 * that describes what the demo does. Pre-Phase-1 it was duplicated as
 *   <div className="px-4 py-2 border-b bg-muted/10">
 *     <p className="text-xs text-muted-foreground">...</p>
 *   </div>
 * across 6+ pages with subtle drift in padding and prose tone.
 */
export function DemoPageDescription({
	children,
	infoBanner,
}: PropsWithChildren<{ infoBanner?: ReactNode }>) {
	return (
		<>
			<div className="px-4 py-2 border-b bg-muted/10">
				<p className="text-xs text-muted-foreground">{children}</p>
			</div>
			{infoBanner}
		</>
	);
}

/**
 * DemoToolbar — the slim toolbar row that sits between the description and
 * the split layout. Hosts <ViewCodeDialog> and any per-page primary controls.
 *
 *   - Right-only:   <DemoToolbar end={<ViewCodeDialog ... />} />
 *   - Left + right: <DemoToolbar start={<ModeToggle/>} end={<ViewCodeDialog/>} />
 */
export function DemoToolbar({
	start,
	end,
}: {
	start?: ReactNode;
	end?: ReactNode;
}) {
	const hasStart = Boolean(start);
	return (
		<div
			className={cn(
				"flex items-center px-4 py-1.5 border-b gap-3",
				hasStart ? "justify-between" : "justify-end"
			)}
		>
			{hasStart ? <div className="flex items-center gap-2">{start}</div> : null}
			{end ? <div className="flex items-center gap-2">{end}</div> : null}
		</div>
	);
}

/**
 * DemoSplitLayout — the canonical 1/2-column split. Left pane is input,
 * right pane is output. On <lg, panes stack vertically.
 *
 * The left pane gets the right border; both panes get internal flex layout
 * so consumers can drop a header + scrollable body without re-wiring.
 */
export function DemoSplitLayout({
	left,
	right,
	className,
}: {
	left: ReactNode;
	right: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b",
				className
			)}
		>
			<div className="border-r flex flex-col overflow-hidden">{left}</div>
			<div className="flex flex-col overflow-hidden">{right}</div>
		</div>
	);
}
