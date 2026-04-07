import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useCallback, useState, type FormEvent } from "react";
import { toast } from "sonner";

interface UseStripeCheckoutResult {
	errorMessage: string | null;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	isReady: boolean;
	isSubmitting: boolean;
}

export const useStripeCheckout = (): UseStripeCheckoutResult => {
	const stripe = useStripe();
	const elements = useElements();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!stripe || !elements || isSubmitting) {
				setErrorMessage("Payment system is not ready. Please try again.");
				return;
			}

			setIsSubmitting(true);
			setErrorMessage(null);

			try {
				const { error, setupIntent } = await stripe.confirmSetup({
					elements,
					redirect: "if_required",
				});

				if (error) {
					setErrorMessage(error.message || "Payment failed");
					toast.error(error.message || "Payment failed");
				} else if (setupIntent?.status === "succeeded") {
					toast.success("Setup Intent confirmed successfully");
				} else if (setupIntent?.status === "processing") {
					toast.info("Payment processing...");
				} else if (setupIntent?.status === "requires_action") {
					// Handle 3D Secure or other required actions
					toast.info("Additional action required. Please check your bank.");
				}
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "An error occurred";
				setErrorMessage(message);
				toast.error(message);
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
	};
};
