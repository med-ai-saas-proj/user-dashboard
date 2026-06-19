import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	getChartMetric,
	type GetChartParams,
} from "../services/get-chart-metric";

import { useChartTimePickerStore } from "../store/chart-time-picker";

export const useGetChartMetric = (params?: GetChartParams) => {
	const updateDateRange = useChartTimePickerStore(
		(state) => state.updateDateRange
	);

	const today = new Date();
	const priorDate = new Date();
	priorDate.setDate(today.getDate() - 30);

	const safeParams = {
		from: params?.from ?? priorDate.toISOString().split("T")[0],
		to: params?.to ?? today.toISOString().split("T")[0],
	};

	useEffect(() => {
		if (!params?.from || !params?.to) {
			updateDateRange(priorDate, today);
		}
	}, [params, updateDateRange, priorDate, today]);

	return useQuery({
		queryKey: ["dashboardMetrics", safeParams],
		queryFn: () => getChartMetric(safeParams),
	});
};
