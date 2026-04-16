import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useState, useEffect, type ReactNode } from "react";
import { useCreateSetupIntent } from "../hooks/organization-billing/use-create-setup-intent";
import { Skeleton } from "@/components/shadcn/skeleton";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
	throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable");
}

const stripePromise = loadStripe(stripePublishableKey);

interface Props {
	children: ReactNode;
}

export function StripeProvider({ children }: Props) {
	const { mutateAsync: getClientSecret } = useCreateSetupIntent();
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchClientSecret = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await getClientSecret();
				const secret = response?.client_secret || response?.clientSecret;
				if (!secret) {
					throw new Error("No client secret received from server");
				}
				setClientSecret(secret);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to initialize payment";
				setError(errorMessage);
				console.error("Setup intent error:", err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchClientSecret();
	}, [getClientSecret]);

	if (isLoading) {
		return (
			<div className="w-full space-y-4 p-6">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg border border-alert p-4 bg-card-gradient text-alert">
				<p className="text-sm font-medium">
					Failed to initialize payment: {error}
				</p>
			</div>
		);
	}

	if (!clientSecret) {
		return (
			<div className="rounded-lg border border-alert p-4 bg-card-gradient text-alert">
				<p className="text-sm font-medium">
					Unable to create payment session. Please try again.
				</p>
			</div>
		);
	}

	const options: StripeElementsOptions = {
		clientSecret,
		appearance: {
			theme: "stripe",
		},
	};

	return (
		<Elements stripe={stripePromise} options={options}>
			{children}
		</Elements>
	);
}
