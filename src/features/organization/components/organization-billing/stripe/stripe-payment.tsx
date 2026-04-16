import { StripeProvider } from "@/features/organization/store/stripe-checkout-provider";
import StripeCheckoutForm from "./stripe-checkout-form";

const StripePayment = () => {
	return (
		<StripeProvider>
			<StripeCheckoutForm />
		</StripeProvider>
	);
};

export default StripePayment;
