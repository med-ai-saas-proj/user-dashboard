import { useTranslation } from "react-i18next";
import { useChartTimePickerStore } from "../store/chart-time-picker";
import DatePickerCustom from "@/components/shadcn/datepicker-custom";

const DashboardDatePicker = () => {
	const { t, i18n } = useTranslation("dashboard");
	const currentLocale = i18n.language || "en-US";

	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleDateSelect = (selectedDate: Date) => {
		updateDateRange(selectedDate, selectedDate);
	};

	return (
		<DatePickerCustom
			label={t("datePicker.label")}
			placeholder={t("datePicker.placeholder")}
			onDateChange={handleDateSelect}
			locale={currentLocale === "vi" ? "vi" : "en-US"}
		/>
	);
};

export default DashboardDatePicker;
