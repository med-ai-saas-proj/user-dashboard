import { useEffect } from "react";
import { Button } from "@/components/shadcn/button";
import { useStripeCheckout } from "@/features/organization/hooks/organization-billing/use-stripe-checkout";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import StripeElement from "./stripe-element";

const StripeCheckoutForm = () => {
	const { t } = useTranslation("billing" as any);
	const { errorMessage, handleSubmit, isReady, isSubmitting, setupStatus } =
		useStripeCheckout();

	useEffect(() => {
		if (setupStatus === "succeeded") {
			toast.success(t("stripe.setupSuccess"));
		}
	}, [setupStatus, t]);

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<StripeElement />
			{errorMessage ? (
				<p className="text-sm text-alert">{errorMessage}</p>
			) : null}
			<div className="flex justify-end">
				<Button type="submit" disabled={!isReady || isSubmitting}>
					{isSubmitting ? t("stripe.processing") : t("stripe.confirmPayment")}
				</Button>
			</div>
		</form>
	);
};

export default StripeCheckoutForm;
