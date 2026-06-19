import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { APIKey } from "@/features/api-keys/api-key.type";
import { enableApiKey } from "../services/enable-api-key";

export const useEnableApiKey = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (apiKeyId: string) => enableApiKey(apiKeyId),
		onMutate: async (apiKeyId) => {
			await queryClient.cancelQueries({ queryKey: ["api-keys"] });

			const previousApiKeyQueries = queryClient.getQueriesData<APIKey[]>({
				queryKey: ["api-keys"],
			});

			queryClient.setQueriesData<APIKey[]>(
				{ queryKey: ["api-keys"] },
				(oldData) => {
					if (!oldData) {
						return oldData;
					}

					return oldData.map((apiKey) => {
						if (apiKey.id !== apiKeyId) {
							return apiKey;
						}

						return {
							...apiKey,
							disabled: false,
						};
					});
				}
			);

			return { previousApiKeyQueries };
		},
		onError: (_error, _variables, context) => {
			if (!context?.previousApiKeyQueries) {
				return;
			}

			for (const [queryKey, queryData] of context.previousApiKeyQueries) {
				queryClient.setQueryData(queryKey, queryData);
			}
		},
	});
};
