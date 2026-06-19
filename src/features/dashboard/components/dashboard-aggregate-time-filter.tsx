import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import DashboardTimeRangePicker from "@/features/dashboard/components/dashboard-time-range-picker";
import {
	Select,
	SelectContent,
	SelectLabel,
	SelectTrigger,
	SelectValue,
	SelectGroup,
	SelectItem,
} from "@/components/shadcn/select";
import type { AggregatePeriod } from "../dashboard.type";
import { useChartTimePickerStore } from "../store/chart-time-picker";

// Timescale configuration based on period
const TIMESCALE_CONFIG: Record<
	AggregatePeriod,
	{ value: number; label: string }[]
> = {
	daily: [
		{ value: 1, label: "1d" },
		{ value: 2, label: "2d" },
		{ value: 7, label: "1w" },
		{ value: 14, label: "2w" },
	],
	weekly: [
		{ value: 1, label: "1w" },
		{ value: 2, label: "2w" },
		{ value: 4, label: "4w" },
	],
	monthly: [
		{ value: 1, label: "1m" },
		{ value: 3, label: "3m (Q)" },
		{ value: 6, label: "6m" },
	],
	yearly: [{ value: 1, label: "1y" }],
};

const TimescaleSelect = () => {
	const { t } = useTranslation("dashboard");
	const period = useChartTimePickerStore((state) => state.period);
	const scale = useChartTimePickerStore((state) => state.scale);
	const updateScale = useChartTimePickerStore((state) => state.updateScale);

	const options = TIMESCALE_CONFIG[period];

	const handleScaleChange = (value: string) => {
		updateScale(Number(value));
	};

	return (
		<div className="flex flex-col items-start justify-center gap-y-2 max-w-sm">
			<p className="text-base font-medium">{t("timescalePicker.label")}</p>
			<Select value={scale.toString()} onValueChange={handleScaleChange}>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={t("timescalePicker.placeholder")} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{t("timescalePicker.label")}</SelectLabel>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value.toString()}>
								{option.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
};

const DashboardAggregateTimeFilter = () => {
	const { t } = useTranslation("dashboard");
	const period = useChartTimePickerStore((state) => state.period);
	const updatePeriod = useChartTimePickerStore((state) => state.updatePeriod);

	// Generate default values for each picker
	const defaultValues = useMemo(() => {
		const today = new Date();
		const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		const startOfYear = new Date(today.getFullYear(), 0, 1);

		return {
			date: today,
			month: startOfMonth,
			dateRange: { from: startOfMonth, to: endOfMonth },
			year: startOfYear,
		};
	}, []);

	const handlePeriodChange = (value: string) => {
		const newPeriod = value as AggregatePeriod;
		updatePeriod(newPeriod);
	};

	return (
		<div className="flex items-center justify-end gap-x-4">
			<div className="flex flex-col items-start justify-center gap-y-2 max-w-sm">
				<p className="text-base font-medium">{t("rangePicker.label")}</p>
				<DashboardTimeRangePicker defaultDate={defaultValues.dateRange} />
			</div>
			<div className="flex flex-col items-start justify-center gap-y-2 max-w-sm">
				<p className="text-base font-medium">{t("periodPicker.label")}</p>
				<Select value={period} onValueChange={handlePeriodChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder={t("periodPicker.placeholder")} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>{t("periodPicker.label")}</SelectLabel>
							<SelectItem value="daily">
								{t("periodPicker.options.daily")}
							</SelectItem>
							<SelectItem value="weekly">
								{t("periodPicker.options.weekly")}
							</SelectItem>
							<SelectItem value="monthly">
								{t("periodPicker.options.monthly")}
							</SelectItem>
							<SelectItem value="yearly">
								{t("periodPicker.options.yearly")}
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<TimescaleSelect />
		</div>
	);
};

export default DashboardAggregateTimeFilter;
