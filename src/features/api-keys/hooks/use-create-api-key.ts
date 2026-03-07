import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApiKey } from "@/features/api-keys/services/create-api-key";
import type { CreateApiKeyRequest } from "../services/api-key.dto";

export const useCreateApiKey = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: CreateApiKeyRequest) => {
			const data = await createApiKey(credentials);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
};
