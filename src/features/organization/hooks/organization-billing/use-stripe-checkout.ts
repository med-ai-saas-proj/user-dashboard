import { useStripe, useElements } from "@stripe/react-stripe-js";
import { useCallback, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
	const { t } = useTranslation("billing");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = useCallback(
		async (event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			if (!stripe || !elements || isSubmitting) {
				setErrorMessage(t("stripe.notReady"));
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
					setErrorMessage(error.message || t("stripe.paymentFailed"));
					toast.error(error.message || t("stripe.paymentFailed"));
				} else if (setupIntent?.status === "succeeded") {
					toast.success(t("stripe.setupSuccess"));
				} else if (setupIntent?.status === "processing") {
					toast.info(t("stripe.processing"));
				} else if (setupIntent?.status === "requires_action") {
					// Handle 3D Secure or other required actions
					toast.info(t("stripe.requiresAction"));
				}
			} catch (err) {
				const message =
					err instanceof Error ? err.message : t("stripe.genericError");
				setErrorMessage(message);
				toast.error(message);
			} finally {
				setIsSubmitting(false);
			}
		},
		[stripe, elements, isSubmitting, t]
	);

	return {
		errorMessage,
		handleSubmit,
		isReady: !!stripe && !!elements,
		isSubmitting,
	};
};
