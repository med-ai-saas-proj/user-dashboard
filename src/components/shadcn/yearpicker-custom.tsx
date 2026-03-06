import { format } from "date-fns";
import { vi as dfVi, enUS as dfEnUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { YearPicker } from "@/components/shadcn/yearpicker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";

/**
 * Props for `YearPickerCustom`.
 *
 * - `id`: optional id for label association.
 * - `label`: visible label above the picker.
 * - `placeholder`: text shown when no year selected.
 * - `year`: controlled selected year (Date representing a year).
 * - `defaultYear`: initial year for uncontrolled mode.
 * - `onYearChange`: callback when a year is selected.
 * - `locale`: "vi" | "en-US" to choose date-fns locale used for formatting.
 * - `className`: additional classes for root container.
 */
type YearPickerCustomProps = {
	id?: string;
	label?: string;
	placeholder?: string;
	year?: Date;
	defaultYear?: Date;
	onYearChange?: (year: Date) => void;
	locale?: "vi" | "en-US";
	className?: string;
};

const YearPickerCustom: React.FC<YearPickerCustomProps> = ({
	id,
	label,
	placeholder = "Select year",
	year: controlledYear,
	defaultYear,
	onYearChange,
	locale = "en-US",
	className,
}) => {
	const [internalYear, setInternalYear] = useState<Date | undefined>(
		defaultYear
	);
	const year = controlledYear ?? internalYear;

	const handleSelect = (y: Date) => {
		if (!controlledYear) setInternalYear(y);
		onYearChange?.(y);
	};

	const dfLocale = locale === "vi" ? dfVi : dfEnUS;

	return (
		<Field className={cn("mx-auto w-fit", className)}>
			{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"w-[280px] justify-start text-left font-normal",
							!year && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{year ? (
							format(year, "yyyy", { locale: dfLocale })
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<YearPicker onYearSelect={handleSelect} selectedYear={year} />
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default YearPickerCustom;
