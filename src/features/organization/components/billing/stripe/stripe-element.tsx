import { PaymentElement } from "@stripe/react-stripe-js/checkout";
import { useState } from "react";

const StripeElement = () => {
	const [errorStripeLoad, setErrorStripeLoad] = useState(false);

	if (errorStripeLoad) {
		return (
			<div className="rounded-lg border border-alert p-4 bg-card-gradient">
				<p className="text-alert">Failed to load Stripe. Please try again.</p>
			</div>
		);
	}

	return (
		<div className="rounded-lg border p-4 bg-card-gradient">
			<PaymentElement
				options={{ layout: "tabs" }}
				onLoadError={() => setErrorStripeLoad(true)}
			/>
		</div>
	);
};

export default StripeElement;
