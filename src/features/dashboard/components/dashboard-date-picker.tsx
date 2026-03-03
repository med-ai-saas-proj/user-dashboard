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
import { useTranslation } from "react-i18next";
import { vi } from "react-day-picker/locale/vi";
import { enUS } from "react-day-picker/locale/en-US";
import { useChartTimePickerStore } from "../store/chart-time-picker";

const DashboardDatePicker = () => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const [date, setDate] = useState<Date>(new Date());
	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleDateSelect = (selectedDate: Date) => {
		setDate(selectedDate);
		updateDateRange(selectedDate, selectedDate);
	};

	return (
		<Field className="mx-auto w-44">
			<FieldLabel htmlFor="date-picker-simple">
				{t("datePicker.label")}
			</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id="date-picker-simple"
						className="justify-start font-normal"
					>
						{date ? (
							format(date, "PPP", {
								locale: currentLocale === "vi" ? vi : enUS,
							})
						) : (
							<span>{t("datePicker.placeholder")}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required
						selected={date}
						onSelect={handleDateSelect}
						defaultMonth={date}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardDatePicker;
