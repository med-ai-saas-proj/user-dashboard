import { Button } from "@/components/shadcn/button";
import { useStripeCheckout } from "@/features/organization/hooks/organization-billing/use-stripe-checkout";
import StripeElement from "./stripe-element";

const StripeCheckoutForm = () => {
	const { errorMessage, handleSubmit, isReady, isSubmitting } =
		useStripeCheckout();

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<StripeElement />
			{errorMessage ? (
				<p className="text-sm text-alert">{errorMessage}</p>
			) : null}
			<Button type="submit" disabled={!isReady || isSubmitting}>
				{isSubmitting ? "Processing..." : "Confirm payment"}
			</Button>
		</form>
	);
};

export default StripeCheckoutForm;
