import { useQuery } from "@tanstack/react-query";
import { getApiKeyDetails } from "../services/get-api-key-details";

export const useGetApiKeyDetails = (apiKeyId: string) => {
	return useQuery({
		queryKey: ["api-key-details", apiKeyId],
		queryFn: () => getApiKeyDetails(apiKeyId),
		enabled: !!apiKeyId,
	});
};
