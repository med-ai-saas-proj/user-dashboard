import { useQuery } from "@tanstack/react-query";
import { getPaymentMethods } from "../../services/organization-billing/get-payment-methods";

export const useGetPaymentMethods = () => {
	return useQuery({
		queryKey: ["payment-methods"],
		queryFn: getPaymentMethods,
	});
};
