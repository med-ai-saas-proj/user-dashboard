import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBillingSource } from "../../services/organization-billing/update-billing-source";
import type { UpdateBillingSourceCredentials } from "../../types/billing";

export const useUpdateBillingSource = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["organization-update-billing-source"],
		mutationFn: (credentials: UpdateBillingSourceCredentials) =>
			updateBillingSource(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-billing-source"],
				exact: false,
			});
		},
		onError: (error) => {
			console.error("Failed to update billing source:", error);
		},
	});
};
