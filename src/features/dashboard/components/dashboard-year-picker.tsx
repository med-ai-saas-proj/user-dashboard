import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { YearPicker } from "@/components/shadcn/yearpicker";
import { cn } from "@/lib/utils";

const DashboardYearPicker = () => {
	const [year, setYear] = useState<Date>();

	return (
		<Field className="mx-auto w-44">
			<FieldLabel htmlFor="year-picker-simple">Pick A Year</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-[280px] justify-start text-left font-normal",
							!year && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{year ? format(year, "yyyy") : <span>Pick a year</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<YearPicker onYearSelect={setYear} selectedYear={year} />
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardYearPicker;
