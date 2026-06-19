export interface CreateCheckoutSessionResponse {
	clientSecret: string;
}

export interface StripeSubscriptionResponse {
	id: string;
	status: string;
	cancelAtPeriodEnd: boolean;
	currentPeriodEnd: string | null;
}

export interface CancelSubscriptionResponse {
	id: string;
	status: string;
	cancelAtPeriodEnd: boolean;
}
