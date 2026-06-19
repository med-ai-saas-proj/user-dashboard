import { create } from "zustand";
import type { AggregatePeriod } from "../dashboard.type";

interface ChartTimePickerState {
	startDate: Date;
	endDate: Date;
	period: AggregatePeriod;
	scale: number;
}

interface ChartTimePickerAction {
	updateStartDate: (date: Date) => void;
	updateEndDate: (date: Date) => void;
	updateDateRange: (startDate: Date, endDate: Date) => void;
	updatePeriod: (period: AggregatePeriod) => void;
	updateScale: (scale: number) => void;
}

type ChartTimePickerStore = ChartTimePickerState & ChartTimePickerAction;

export const useChartTimePickerStore = create<ChartTimePickerStore>((set) => ({
	startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
	endDate: new Date(),
	period: "daily",
	scale: 1,
	updateStartDate: (date) => set({ startDate: date }),
	updateEndDate: (date) => set({ endDate: date }),
	updateDateRange: (startDate, endDate) => set({ startDate, endDate }),
	updatePeriod: (period) => set({ period }),
	updateScale: (scale) => set({ scale }),
}));
