import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "../../services/organization-billing/create-checkout-session";

export const useCreateCheckoutSession = () => {
	return useMutation({
		mutationKey: ["create-checkout-session"],
		mutationFn: createCheckoutSession,
	});
};
