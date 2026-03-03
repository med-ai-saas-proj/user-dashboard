import DashboardDatePicker from "./dashboard-date-picker";
import DashboardMonthPicker from "./dashboard-month-picker";
import DashboardTimeRangePicker from "./dashboard-time-range-picker";
import DashboardYearPicker from "./dashboard-year-picker";

const DashboardTimePicker = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
		</div>
	);
};

export default DashboardTimePicker;
