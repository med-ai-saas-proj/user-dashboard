import Mock from "mockjs";
import type {
	CancelSubscriptionResponse,
	StripeSubscriptionResponse,
} from "@/features/organization/types/stripe";

const billingPrefixPattern = /(http?:\/\/[^/]+)?\/billing\//;

let mockSubscription: StripeSubscriptionResponse = {
	id: "sub_mock_001",
	status: "active",
	cancelAtPeriodEnd: false,
	currentPeriodEnd: new Date(
		Date.now() + 1000 * 60 * 60 * 24 * 30
	).toISOString(),
};

Mock.mock(
	new RegExp(`${billingPrefixPattern.source}create-checkout-session$`),
	"post",
	() => {
		return {
			clientSecret: "mock_client_secret_123",
		};
	}
);

Mock.mock(
	new RegExp(`${billingPrefixPattern.source}subscription$`),
	"get",
	() => {
		return mockSubscription;
	}
);

Mock.mock(new RegExp(`${billingPrefixPattern.source}cancel$`), "post", () => {
	mockSubscription = {
		...mockSubscription,
		status: "canceled",
		cancelAtPeriodEnd: true,
	};

	const response: CancelSubscriptionResponse = {
		id: mockSubscription.id,
		status: mockSubscription.status,
		cancelAtPeriodEnd: mockSubscription.cancelAtPeriodEnd,
	};

	return response;
});
