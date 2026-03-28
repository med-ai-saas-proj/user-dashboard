import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteApiKey } from "@/features/api-keys/services/delete-api-key";

export const useDeleteApiKey = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationFn: async (apikeyId: string) => {
			const data = await deleteApiKey(apikeyId);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
			toast.success(tCommon("requestDone"));
		},
		onError: () => {
			toast.error(tCommon("error"));
		},
	});
};
