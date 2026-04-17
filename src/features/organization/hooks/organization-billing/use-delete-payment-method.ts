import { useMutation } from "@tanstack/react-query";
import { deletePaymentMethod } from "../../services/organization-billing/delete-payment-method";

export const useDeletePaymentMethod = () => {
	return useMutation({
		mutationKey: ["payment-method-delete"],
		mutationFn: (paymentMethodId: string) =>
			deletePaymentMethod({ paymentMethodId }),
	});
};
