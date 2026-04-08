import { useTranslation } from "react-i18next";
import { useChartTimePickerStore } from "../store/chart-time-picker";
import DatePickerCustom from "@/components/shadcn/datepicker-custom";

interface DashboardDatePickerProps {
	defaultDate?: Date;
}

const DashboardDatePicker: React.FC<DashboardDatePickerProps> = ({
	defaultDate,
}) => {
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
			placeholder={t("datePicker.placeholder")}
			onDateChange={handleDateSelect}
			className="min-w-36"
			locale={currentLocale === "vi" ? "vi" : "en-US"}
			defaultDate={defaultDate}
		/>
	);
};

export default DashboardDatePicker;
