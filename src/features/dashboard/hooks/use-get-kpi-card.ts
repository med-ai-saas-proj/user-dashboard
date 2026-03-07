import { useQuery } from "@tanstack/react-query";
import { getKPICard } from "../services/get-kpi";

export const useGetKPICard = () => {
	return useQuery({
		queryKey: ["kpiCard"],
		queryFn: getKPICard,
	});
};
