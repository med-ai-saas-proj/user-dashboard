import { useTranslation } from "react-i18next";
import { useChartTimePickerStore } from "../store/chart-time-picker";
import MonthPickerCustom from "@/components/shadcn/monthpicker-custom";

const DashboardMonthPicker = () => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleMonthSelect = (selectedMonth: Date) => {
		const startDate = new Date(
			selectedMonth.getFullYear(),
			selectedMonth.getMonth(),
			1
		);
		const endDate = new Date(
			selectedMonth.getFullYear(),
			selectedMonth.getMonth() + 1,
			0
		);
		updateDateRange(startDate, endDate);
	};

	return (
		<MonthPickerCustom
			placeholder={t("monthPicker.placeholder")}
			onMonthChange={handleMonthSelect}
			locale={currentLocale === "vi" ? "vi" : "en-US"}
		/>
	);
};

export default DashboardMonthPicker;
