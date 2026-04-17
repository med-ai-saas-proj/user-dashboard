import { useQuery } from "@tanstack/react-query";
import { getAggregateByProjects } from "../services/get-aggregate-by-projects";
import type { AggregateParams } from "../dashboard.type";

export const useGetAggregateByProjects = (
	params: AggregateParams & { projectUids: string[] }
) => {
	return useQuery({
		queryKey: [
			"aggregate-by-projects",
			params.periodStart,
			params.periodEnd,
			params.period,
			params.periodScale,
			params.projectUids.join(","),
		],
		queryFn: () => getAggregateByProjects(params),
	});
};
