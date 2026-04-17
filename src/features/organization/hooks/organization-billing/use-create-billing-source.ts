import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBillingSource } from "../../services/organization-billing/create-billing-source";
import type { CreateBillingSourceCredentials } from "../../types/billing";

export const useCreateBillingSource = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["organization-create-billing-source"],
		mutationFn: (credentials: CreateBillingSourceCredentials) =>
			createBillingSource(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-billing-source"],
				exact: false,
			});
		},
	});
};
