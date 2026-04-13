import { useQuery } from "@tanstack/react-query";
import { getAggregateByApiKeys } from "../services/get-aggregate-by-api-keys";
import type { AggregateParams } from "../dashboard.type";

export const useGetAggregateByApiKeys = (
	params: AggregateParams & { apiKeys: string[] }
) => {
	return useQuery({
		queryKey: [
			"aggregate-by-api-keys",
			params.periodStart,
			params.periodEnd,
			params.period,
			params.periodScale,
			params.apiKeys.join(","),
		],
		queryFn: () => getAggregateByApiKeys(params),
	});
};
