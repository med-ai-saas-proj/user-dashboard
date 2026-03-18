import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type {
	CreateCheckoutSessionResponse,
	// CancelSubscriptionResponse,
	// StripeSubscriptionResponse,
} from "../../types/stripe";

export const createCheckoutSession = async (): Promise<string> => {
	const res = await apiClient.post<CreateCheckoutSessionResponse>(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION.BILLING}/create-checkout-session`
	);

	return res.data.clientSecret;
};

// export const getSubscription =
//     async (): Promise<StripeSubscriptionResponse> => {
//         const res = await apiClient.get<StripeSubscriptionResponse>(
//             `${API_ROUTES.MANAGEMENT.ORGANIZATION.BILLING}/subscription`,
//         );

//         return res.data;
//     };

// export const cancelSubscription =
//     async (): Promise<CancelSubscriptionResponse> => {
//         const res =
//             await apiClient.post<CancelSubscriptionResponse>(`${API_ROUTES.MANAGEMENT.ORGANIZATION.BILLING}/cancel`);

//         return res.data;
//     };
