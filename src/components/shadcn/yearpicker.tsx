"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

type YearCalProps = {
	selectedYear?: Date;
	onYearSelect?: (date: Date) => void;
	onYearForward?: () => void;
	onYearBackward?: () => void;
	callbacks?: {
		rangeLabel?: (start: number, end: number) => string;
		yearLabel?: (year: number) => string;
	};
	variant?: {
		calendar?: {
			main?: ButtonVariant;
			selected?: ButtonVariant;
		};
		chevrons?: ButtonVariant;
	};
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
};

type ButtonVariant =
	| "default"
	| "outline"
	| "ghost"
	| "link"
	| "destructive"
	| "secondary"
	| null
	| undefined;

function YearPicker({
	onYearSelect,
	selectedYear,
	minDate,
	maxDate,
	disabledDates,
	callbacks,
	onYearBackward,
	onYearForward,
	variant,
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & YearCalProps) {
	return (
		<div className={cn("min-w-[200px] w-[280px] p-3", className)} {...props}>
			<div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">
				<div className="space-y-4 w-full">
					<YearCal
						onYearSelect={onYearSelect}
						callbacks={callbacks}
						selectedYear={selectedYear}
						onYearBackward={onYearBackward}
						onYearForward={onYearForward}
						variant={variant}
						minDate={minDate}
						maxDate={maxDate}
						disabledDates={disabledDates}
					/>
				</div>
			</div>
		</div>
	);
}

function YearCal({
	selectedYear,
	onYearSelect,
	callbacks,
	variant,
	minDate,
	maxDate,
	disabledDates,
	onYearBackward,
	onYearForward,
}: YearCalProps) {
	const currentYear = selectedYear?.getFullYear() ?? new Date().getFullYear();
	const [menuYear, setMenuYear] = React.useState<number>(currentYear);

	if (minDate && maxDate && minDate > maxDate) minDate = maxDate;

	const disabledYears = disabledDates?.map((d) => d.getFullYear());

	// Show a 12-year grid. Start aligned to groups of 12 for predictable navigation.
	const start = Math.floor(menuYear / 12) * 12;
	const years = Array.from({ length: 12 }, (_, i) => start + i);

	const rows: number[][] = [];
	for (let r = 0; r < 3; r++) {
		rows.push(years.slice(r * 4, r * 4 + 4));
	}

	const isDisabled = (y: number) => {
		if (maxDate && y > maxDate.getFullYear()) return true;
		if (minDate && y < minDate.getFullYear()) return true;
		if (disabledYears?.some((dy) => dy === y)) return true;
		return false;
	};

	return (
		<>
			<div className="flex justify-center pt-1 relative items-center">
				<div className="text-sm font-medium">
					{callbacks?.rangeLabel
						? callbacks.rangeLabel(start, start + 11)
						: `${start} - ${start + 11}`}
				</div>
				<div className="space-x-1 flex items-center">
					<button
						type="button"
						onClick={() => {
							setMenuYear((y) => y - 12);
							if (onYearBackward) onYearBackward();
						}}
						className={cn(
							buttonVariants({
								variant: variant?.chevrons ?? "outline",
							}),
							"inline-flex items-center justify-center h-7 w-7 p-0 absolute left-1"
						)}
					>
						<ChevronLeft className="opacity-50 h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => {
							setMenuYear((y) => y + 12);
							if (onYearForward) onYearForward();
						}}
						className={cn(
							buttonVariants({
								variant: variant?.chevrons ?? "outline",
							}),
							"inline-flex items-center justify-center h-7 w-7 p-0 absolute right-1"
						)}
					>
						<ChevronRight className="opacity-50 h-4 w-4" />
					</button>
				</div>
			</div>

			<table className="w-full border-collapse space-y-1">
				<tbody>
					{rows.map((row, i) => (
						<tr key={i} className="flex w-full mt-2">
							{row.map((y) => (
								<td
									key={y}
									className="h-10 w-1/4 text-center text-sm p-0 relative"
								>
									<button
										type="button"
										onClick={() => {
											if (isDisabled(y)) return;
											if (onYearSelect) onYearSelect(new Date(y, 0));
											setMenuYear(y);
										}}
										disabled={isDisabled(y)}
										className={cn(
											buttonVariants({
												variant:
													selectedYear?.getFullYear() === y
														? (variant?.calendar?.selected ?? "default")
														: (variant?.calendar?.main ?? "ghost"),
											}),
											"h-full w-full p-0 font-normal aria-selected:opacity-100"
										)}
									>
										{callbacks?.yearLabel ? callbacks.yearLabel(y) : String(y)}
									</button>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}

YearPicker.displayName = "YearPicker";

export { YearPicker };
