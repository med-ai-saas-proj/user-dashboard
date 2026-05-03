import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DemoEmptyStateProps {
	/**
	 * Lucide icon (or any component that accepts className). Optional — pass
	 * `null` if the page wants a text-only empty state.
	 */
	icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }> | null;
	/**
	 * Primary instruction line. Accepts ReactNode so callers can mix in
	 * <strong> for the action button name.
	 */
	description: ReactNode;
	/**
	 * Optional secondary hint shown in a smaller dimmer style.
	 */
	hint?: ReactNode;
	className?: string;
}

/**
 * DemoEmptyState — the canonical right-pane empty state for split-layout
 * demo pages. Pre-Phase-1 every page hand-rolled this with subtle drift:
 * inconsistent icon sizes, missing aria labels, varying gap spacing,
 * and inline SVGs that violated DESIGN.md (the design system mandates
 * Lucide icons or shadcn primitives).
 *
 * Used by the right pane of every two-column playground demo.
 */
export function DemoEmptyState({
	icon: Icon,
	description,
	hint,
	className,
}: DemoEmptyStateProps) {
	return (
		<div
			className={cn("flex-1 flex items-center justify-center p-8", className)}
		>
			<div className="text-center space-y-3 max-w-sm">
				{Icon ? (
					<div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
						<Icon
							className="w-6 h-6 text-muted-foreground"
							aria-hidden={true}
						/>
					</div>
				) : null}
				<p className="text-sm text-muted-foreground">{description}</p>
				{hint ? (
					<p className="text-xs text-muted-foreground/60">{hint}</p>
				) : null}
			</div>
		</div>
	);
}
