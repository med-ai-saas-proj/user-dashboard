import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const StripeElement = () => {
	const { t } = useTranslation("billing" as any);
	const [errorStripeLoad, setErrorStripeLoad] = useState(false);

	if (errorStripeLoad) {
		return (
			<div className="rounded-lg border border-alert p-4 bg-card-gradient">
				<p className="text-alert">{t("stripe.loadError")}</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border p-4 bg-card-gradient">
			<PaymentElement
				options={{
					layout: "tabs",
					wallets: {
						googlePay: "auto",
						applePay: "auto",
					},
				}}
				onLoadError={() => setErrorStripeLoad(true)}
			/>
		</div>
	);
};

export default StripeElement;
