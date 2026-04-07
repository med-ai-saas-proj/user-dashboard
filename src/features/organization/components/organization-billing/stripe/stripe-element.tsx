import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";

const StripeElement = () => {
	const [errorStripeLoad, setErrorStripeLoad] = useState(false);

	if (errorStripeLoad) {
		return (
			<div className="rounded-lg border border-alert p-4 bg-card-gradient">
				<p className="text-alert">
					Failed to load payment form. Please try again.
				</p>
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
