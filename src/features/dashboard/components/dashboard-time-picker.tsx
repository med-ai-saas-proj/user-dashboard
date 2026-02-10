import DashboardDatePicker from "./dashboard-date-picker";
import DashboardMonthPicker from "./dashboard-month-picker";
import DashboardTimeRangePicker from "./dashboard-time-range-picker";
import DashboardYearPicker from "./dashboard-year-picker";

const DashboardTimePicker = () => {
	return (
		<>
			<div className="flex flex-col items-start gap-4">
				<div className="w-auto">
					<DashboardDatePicker />
				</div>
				<div className="w-auto">
					<DashboardTimeRangePicker />
				</div>
			</div>
			<div className="flex flex-col items-start gap-4">
				<div className="w-auto">
					<DashboardMonthPicker />
				</div>
				<div className="w-auto">
					<DashboardYearPicker />
				</div>
			</div>
		</>
	);
};

export default DashboardTimePicker;
