import { useQuery } from "@tanstack/react-query";
import { getLog } from "../services/get-log";
import type { LoggingParams } from "../types/logging";

export const useGetLog = (params: LoggingParams) => {
	if (!params.limit) params.limit = 100;
	if (!params.direction) params.direction = "backward";

	return useQuery({
		queryKey: ["logging", params],
		queryFn: () => getLog(params),
	});
};

export type UseGetLogReturn = ReturnType<typeof useGetLog>;
