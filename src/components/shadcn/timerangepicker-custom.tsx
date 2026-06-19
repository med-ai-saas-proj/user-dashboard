import { format } from "date-fns";
import { vi as dfVi, enUS as dfEnUS } from "date-fns/locale";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { Calendar } from "@/components/shadcn/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import { vi as rdVi } from "react-day-picker/locale/vi";
import { enUS as rdEnUS } from "react-day-picker/locale/en-US";

/**
 * Props for `TimeRangePickerCustom`.
 *
 * - `id`: optional id for label association.
 * - `label`: visible label above the picker.
 * - `placeholder`: text when no range selected.
 * - `date`: controlled selected range.
 * - `defaultDate`: initial range for uncontrolled mode.
 * - `onDateChange`: callback invoked with the selected `DateRange`.
 * - `locale`: "vi" | "en-US" for formatting and calendar locale.
 * - `className`: additional classes for root container.
 */
type TimeRangePickerCustomProps = {
	id?: string;
	label?: string;
	placeholder?: string;
	date?: DateRange | undefined;
	defaultDate?: DateRange | undefined;
	onDateChange?: (d: DateRange | undefined) => void;
	locale?: "vi" | "en-US";
	className?: string;
};

const TimeRangePickerCustom: React.FC<TimeRangePickerCustomProps> = ({
	id,
	label,
	placeholder = "Select range",
	date: controlledDate,
	defaultDate,
	onDateChange,
	locale = "en-US",
	className,
}) => {
	const [internalDate, setInternalDate] = useState<DateRange | undefined>(
		defaultDate
	);
	const date = controlledDate ?? internalDate;

	const handleSelect = (d: DateRange | undefined) => {
		if (!controlledDate) setInternalDate(d);
		onDateChange?.(d);
	};

	const dfLocale = locale === "vi" ? dfVi : dfEnUS;
	const rdLocale = locale === "vi" ? rdVi : rdEnUS;

	return (
		<Field className={cn("mx-auto w-fit", className)}>
			{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id={id}
						className="justify-start px-2.5 font-normal"
					>
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y", {
										locale: dfLocale,
									})}{" "}
									-{" "}
									{format(date.to, "LLL dd, y", {
										locale: dfLocale,
									})}
								</>
							) : (
								format(date.from, "LLL dd, y", {
									locale: dfLocale,
								})
							)
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={handleSelect}
						numberOfMonths={2}
						dateFnsLocale={dfLocale}
						locale={rdLocale}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default TimeRangePickerCustom;
