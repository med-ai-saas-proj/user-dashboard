import { useCheckout } from "@stripe/react-stripe-js/checkout";
import { useCallback, useState, type FormEvent } from "react";

interface UseStripeCheckoutResult {
	errorMessage: string | null;
	handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
	isReady: boolean;
	isSubmitting: boolean;
}

export const useStripeCheckout = (): UseStripeCheckoutResult => {
	const checkoutState = useCheckout();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (checkoutState.type !== "success" || isSubmitting) {
				return;
			}

			setIsSubmitting(true);
			setErrorMessage(null);

			const result = await checkoutState.checkout.confirm();

			if (result.type === "error") {
				setErrorMessage(result.error.message);
			}

			setIsSubmitting(false);
		},
		[checkoutState, isSubmitting]
	);

	return {
		errorMessage,
		handleSubmit,
		isReady: checkoutState.type === "success",
		isSubmitting,
	};
};
