import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/shadcn/button";
import { Calendar } from "@/components/shadcn/calendar";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { useTranslation } from "react-i18next";
import { vi } from "react-day-picker/locale/vi";
import { enUS } from "react-day-picker/locale/en-US";
import { useChartTimePickerStore } from "../store/chart-time-picker";

const DashboardTimeRangePicker = () => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const [date, setDate] = useState<DateRange | undefined>();
	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleDateSelect = (selectedDate: DateRange | undefined) => {
		setDate(selectedDate);
		if (selectedDate?.from && selectedDate?.to) {
			updateDateRange(selectedDate.from, selectedDate.to);
		} else if (selectedDate?.from) {
			updateDateRange(selectedDate.from, selectedDate.from);
		} else {
			updateDateRange(new Date(), new Date());
		}
	};

	return (
		<Field className="mx-auto w-60">
			<FieldLabel htmlFor="date-picker-range">
				{t("rangePicker.label")}
			</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id="date-picker-range"
						className="justify-start px-2.5 font-normal"
					>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, "LLL dd, y", {
										locale: currentLocale === "vi" ? vi : enUS,
									})}{" "}
									-{" "}
									{format(date.to, "LLL dd, y", {
										locale: currentLocale === "vi" ? vi : enUS,
									})}
								</>
							) : (
								format(date.from, "LLL dd, y", {
									locale: currentLocale === "vi" ? vi : enUS,
								})
							)
						) : (
							<span>{t("rangePicker.placeholder")}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						defaultMonth={date?.from}
						selected={date}
						onSelect={handleDateSelect}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardTimeRangePicker;
