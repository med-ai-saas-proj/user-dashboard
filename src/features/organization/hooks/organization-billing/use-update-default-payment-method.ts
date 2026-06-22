import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDefaultPaymentMethod } from "../../services/organization-billing/update-default-payment-method";

export const useUpdateDefaultPaymentMethod = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["update-default-payment-method"],
		mutationFn: (paymentMethodId: string) =>
			updateDefaultPaymentMethod(paymentMethodId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-billing-source"],
				exact: true,
			});
		},
	});
};
