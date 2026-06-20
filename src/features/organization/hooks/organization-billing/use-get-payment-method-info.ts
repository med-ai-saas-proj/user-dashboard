import { useQuery } from "@tanstack/react-query";
import { getPaymentMethodInfo } from "../../services/organization-billing/get-payment-method-info";

export const useGetPaymentMethodInfo = (paymentMethodId: string | null) => {
	return useQuery({
		queryKey: ["payment-method-info", paymentMethodId],
		queryFn: () => {
			if (!paymentMethodId) {
				throw new Error("Payment method ID is required");
			}
			return getPaymentMethodInfo(paymentMethodId);
		},
		enabled: !!paymentMethodId,
	});
};
