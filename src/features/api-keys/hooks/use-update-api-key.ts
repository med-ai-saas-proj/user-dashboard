import { useMutation } from "@tanstack/react-query";
import { updateApiKey } from "@/features/api-keys/services/update-api-key";
import { useQueryClient } from "@tanstack/react-query";
import type { APIKey } from "@/features/api-keys/api-key.type";

export const useUpdateApiKey = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: {
			apikeyId: string;
			name?: string;
			description?: string;
			permissions?: string[];
		}) => {
			const data = await updateApiKey({
				apikeyId: credentials.apikeyId,
				name: credentials.name,
				description: credentials.description,
				permissions: credentials.permissions,
			});
			return data;
		},
		onMutate: async (credentials) => {
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
						if (apiKey.id !== credentials.apikeyId) {
							return apiKey;
						}

						return {
							...apiKey,
							name: credentials.name ?? apiKey.name,
							description: credentials.description ?? apiKey.description,
							permissions: credentials.permissions ?? apiKey.permissions,
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
