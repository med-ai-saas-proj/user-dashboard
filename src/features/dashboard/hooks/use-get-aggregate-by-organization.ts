import { useQuery } from "@tanstack/react-query";
import { getAggregateByOrganization } from "../services/get-aggregate-by-organization";
import type { AggregateParams } from "../dashboard.type";

export const useGetAggregateByOrganization = (params: AggregateParams) => {
	return useQuery({
		queryKey: [
			"aggregate-by-organization",
			params.periodStart,
			params.periodEnd,
			params.period,
			params.periodScale,
		],
		queryFn: () => getAggregateByOrganization(params),
	});
};
