import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect, type ReactNode } from "react";
import { useCreateCheckoutSession } from "../hooks/organization-billing/use-create-checkout-sesstion";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
	throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable");
}

const stripePromise = loadStripe(stripePublishableKey);

interface Props {
	children: ReactNode;
}

export function StripeProvider({ children }: Props) {
	const { mutateAsync: getClientSecret } = useCreateCheckoutSession();

	// Need a real client secret from the Backend, cannot mock
	const [clientSecret, setClientSecret] = useState<string | null>(null);

	useEffect(() => {
		const fetchClientSecret = async () => {
			try {
				const secret = await getClientSecret();

				setClientSecret(secret);
			} catch (error) {
				console.error(error);
			}
		};

		fetchClientSecret();
	}, [getClientSecret]);

	if (!clientSecret) {
		return <div>Loading payment...</div>;
	}

	return (
		<CheckoutProvider
			stripe={stripePromise}
			options={{
				clientSecret,
			}}
		>
			{children}
		</CheckoutProvider>
	);
}
