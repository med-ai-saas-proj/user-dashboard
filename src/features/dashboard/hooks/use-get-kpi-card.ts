import { useQuery } from "@tanstack/react-query";
import { getKPICard } from "../services/kpi-card";

export const useGetKPICard = () => {
	return useQuery({
		queryKey: ["kpiCard"],
		queryFn: getKPICard,
	});
};
