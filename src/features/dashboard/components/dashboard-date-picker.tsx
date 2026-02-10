import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Calendar } from "@/components/shadcn/calendar";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";

const DashboardDatePicker = () => {
	const [date, setDate] = useState<Date>(new Date());

	return (
		<Field className="mx-auto w-44">
			<FieldLabel htmlFor="date-picker-simple">Pick A Date</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id="date-picker-simple"
						className="justify-start font-normal"
					>
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required
						selected={date}
						onSelect={setDate}
						defaultMonth={date}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardDatePicker;
