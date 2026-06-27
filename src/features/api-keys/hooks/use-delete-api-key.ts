import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteApiKey } from "@/features/api-keys/services/delete-api-key";

export const useDeleteApiKey = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (apikeyId: string) => {
			const data = await deleteApiKey(apikeyId);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
	});
};
