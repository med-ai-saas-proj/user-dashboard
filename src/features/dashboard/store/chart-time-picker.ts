import { create } from "zustand";

interface ChartTimePickerState {
	startDate: Date;
	endDate: Date;
}

interface ChartTimePickerAction {
	updateStartDate: (date: Date) => void;
	updateEndDate: (date: Date) => void;
	updateDateRange: (startDate: Date, endDate: Date) => void;
}

type ChartTimePickerStore = ChartTimePickerState & ChartTimePickerAction;

export const useChartTimePickerStore = create<ChartTimePickerStore>((set) => ({
	startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
	endDate: new Date(),
	updateStartDate: (date) => set({ startDate: date }),
	updateEndDate: (date) => set({ endDate: date }),
	updateDateRange: (startDate, endDate) => set({ startDate, endDate }),
}));
