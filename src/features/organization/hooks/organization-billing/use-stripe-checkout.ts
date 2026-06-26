import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useCallback, useState, type FormEvent } from "react";

interface UseStripeCheckoutResult {
	errorMessage: string | null;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	isReady: boolean;
	isSubmitting: boolean;
	setupStatus: string | null;
}

export const useStripeCheckout = (): UseStripeCheckoutResult => {
	const stripe = useStripe();
	const elements = useElements();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [setupStatus, setSetupStatus] = useState<string | null>(null);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!stripe || !elements || isSubmitting) {
				setErrorMessage("Stripe is not ready");
				return;
			}

			setIsSubmitting(true);
			setErrorMessage(null);
			setSetupStatus(null);

			try {
				const { error, setupIntent } = await stripe.confirmSetup({
					elements,
					redirect: "if_required",
				});

				if (error) {
					setErrorMessage(error.message || "Payment failed");
				} else if (setupIntent?.status) {
					setSetupStatus(setupIntent.status);
				}
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "An unexpected error occurred";
				setErrorMessage(message);
			} finally {
				setIsSubmitting(false);
			}
		},
		[stripe, elements, isSubmitting]
	);

	return {
		errorMessage,
		handleSubmit,
		isReady: !!stripe && !!elements,
		isSubmitting,
		setupStatus,
	};
};
