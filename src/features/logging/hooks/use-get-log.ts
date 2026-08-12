import { useQuery } from "@tanstack/react-query";
import { getLog } from "../services/get-log";
import type { LoggingParams } from "../types/logging";

export const useGetLog = (params: LoggingParams) => {
	const normalized: LoggingParams = {
		...params,
		limit: params.limit ?? 100,
		direction: params.direction ?? "backward",
	};

	return useQuery({
		queryKey: ["logging", normalized],
		queryFn: () => getLog(normalized),
	});
};

export type UseGetLogReturn = ReturnType<typeof useGetLog>;
