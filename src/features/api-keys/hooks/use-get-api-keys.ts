import { useQuery } from "@tanstack/react-query";
import { getApiKeys } from "@/features/api-keys/services/get-api-keys";

export const useGetApiKeys = (projectId: string) => {
	return useQuery({
		queryKey: ["api-keys", projectId],
		queryFn: () => getApiKeys(projectId),
		enabled: !!projectId,
	});
};
