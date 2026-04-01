import { useTranslation } from "react-i18next";
import { useChartTimePickerStore } from "../store/chart-time-picker";
import YearPickerCustom from "@/components/shadcn/yearpicker-custom";

interface DashboardYearPickerProps {
	defaultDate?: Date;
}

const DashboardYearPicker: React.FC<DashboardYearPickerProps> = ({
	defaultDate,
}) => {
	const { t, i18n } = useTranslation("dashboard");
	const currentLocale = i18n.language || "en-US";

	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const handleYearSelect = (selectedYear: Date) => {
		const startDate = new Date(selectedYear.getFullYear(), 0, 1);
		const endDate = new Date(selectedYear.getFullYear(), 11, 31);
		updateDateRange(startDate, endDate);
	};

	return (
		<YearPickerCustom
			placeholder={t("yearPicker.placeholder")}
			onYearChange={handleYearSelect}
			locale={currentLocale === "vi" ? "vi" : "en-US"}
			defaultYear={defaultDate}
		/>
	);
};

export default DashboardYearPicker;
