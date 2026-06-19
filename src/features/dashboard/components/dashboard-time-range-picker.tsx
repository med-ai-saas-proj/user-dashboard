import { useTranslation } from "react-i18next";
import { useChartTimePickerStore } from "../store/chart-time-picker";
import TimeRangePickerCustom from "@/components/shadcn/timerangepicker-custom";
import type { DateRange } from "react-day-picker";

interface DashboardTimeRangePickerProps {
	defaultDate?: DateRange;
}

const DashboardTimeRangePicker: React.FC<DashboardTimeRangePickerProps> = ({
	defaultDate,
}) => {
	const { t, i18n } = useTranslation("dashboard");
	const currentLocale = i18n.language || "en-US";

	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleDateSelect = (selectedDate: DateRange | undefined) => {
		if (selectedDate?.from && selectedDate?.to) {
			updateDateRange(selectedDate.from, selectedDate.to);
		} else if (selectedDate?.from) {
			updateDateRange(selectedDate.from, selectedDate.from);
		} else {
			updateDateRange(new Date(), new Date());
		}
	};

	return (
		<TimeRangePickerCustom
			placeholder={t("rangePicker.placeholder")}
			onDateChange={handleDateSelect}
			locale={currentLocale === "vi" ? "vi" : "en-US"}
			defaultDate={defaultDate}
		/>
	);
};

export default DashboardTimeRangePicker;
