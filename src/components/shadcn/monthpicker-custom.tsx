import { format } from "date-fns";
import { vi as dfVi, enUS as dfEnUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { MonthPicker } from "@/components/shadcn/monthpicker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";

/**
 * Props for `MonthPickerCustom`.
 *
 * - `id` : Optional id used for the label/input association.
 * - `label` : Optional visible label displayed above the picker.
 * - `placeholder` : Text shown inside the trigger when no month is selected.
 * - `month` : Controlled selected month. When provided the component becomes controlled
 *             and will display this value instead of managing internal state.
 * - `defaultMonth` : Initial month used for uncontrolled mode (only when `month` is not provided).
 * - `onMonthChange` : Callback invoked with the newly selected `Date` (the month chosen).
 * - `locale` : Locale identifier used for formatting the displayed month. Accepts "vi" or "en-US".
 * - `className` : Additional CSS classes to apply to the root `Field` container.
 */
type MonthPickerCustomProps = {
	id?: string;
	label?: string;
	placeholder?: string;
	month?: Date;
	defaultMonth?: Date;
	onMonthChange?: (month: Date) => void;
	locale?: "vi" | "en-US";
	className?: string;
};

const MonthPickerCustom: React.FC<MonthPickerCustomProps> = ({
	id,
	label,
	placeholder = "Select month",
	month: controlledMonth,
	defaultMonth,
	onMonthChange,
	locale = "en-US",
	className,
}) => {
	const [internalMonth, setInternalMonth] = useState<Date | undefined>(
		defaultMonth
	);
	const month = controlledMonth ?? internalMonth;
	const handleSelect = (m: Date) => {
		if (!controlledMonth) setInternalMonth(m);
		onMonthChange?.(m);
	};

	// `dfLocale` is used with `date-fns.format`.
	const dfLocale = locale === "vi" ? dfVi : dfEnUS;

	return (
		<Field className={cn("mx-auto w-fit", className)}>
			{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[280px] justify-center font-normal",
							!month && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{month ? (
							format(month, "MMM yyyy", { locale: dfLocale })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<MonthPicker
						onMonthSelect={handleSelect}
						selectedMonth={month}
						dateFnsLocale={dfLocale}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default MonthPickerCustom;
