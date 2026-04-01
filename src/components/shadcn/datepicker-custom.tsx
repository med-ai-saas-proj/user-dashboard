import { Button } from "@/components/shadcn/button";
import { Calendar } from "@/components/shadcn/calendar";
import { Field } from "@/components/shadcn/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { enUS as dfEnUS, vi as dfVi } from "date-fns/locale";
import { useState } from "react";
import { enUS as rdEnUS } from "react-day-picker/locale/en-US";
import { vi as rdVi } from "react-day-picker/locale/vi";

/**
 * Props for `DatePickerCustom`.
 *
 * - `id`: optional id for label association.
 * - `label`: visible label above the picker.
 * - `placeholder`: text shown when no date selected.
 * - `date`: controlled selected date.
 * - `defaultDate`: initial date for uncontrolled mode.
 * - `onDateChange`: callback invoked when the user selects a date.
 * - `locale`: "vi" | "en-US" to choose date-fns/react-day-picker locale.
 * - `className`: additional classes for root container.
 */
type DatePickerCustomProps = {
	id?: string;
	label?: string;
	placeholder?: string;
	date?: Date;
	defaultDate?: Date;
	onDateChange?: (d: Date) => void;
	locale?: "vi" | "en-US";
	className?: string;
};

const DatePickerCustom: React.FC<DatePickerCustomProps> = ({
	id,
	placeholder = "Select date",
	date: controlledDate,
	defaultDate,
	onDateChange,
	locale = "en-US",
	className,
}) => {
	const [internalDate, setInternalDate] = useState<Date | undefined>(
		defaultDate
	);
	const date = controlledDate ?? internalDate;

	const handleSelect = (d: Date) => {
		if (!controlledDate) setInternalDate(d);
		onDateChange?.(d);
	};

	const dfLocale = locale === "vi" ? dfVi : dfEnUS;
	const rdLocale = locale === "vi" ? rdVi : rdEnUS;

	return (
		<Field className={cn("mx-auto w-fit", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id={id}
						className="justify-center font-normal"
					>
						{date ? (
							format(date, "PPP", { locale: dfLocale })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required
						selected={date}
						onSelect={handleSelect}
						defaultMonth={date}
						dateFnsLocale={dfLocale}
						locale={rdLocale}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DatePickerCustom;
