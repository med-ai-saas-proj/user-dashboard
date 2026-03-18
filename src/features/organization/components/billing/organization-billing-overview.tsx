import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { CreditCard } from "lucide-react";
import StripePayment from "./stripe/stripe-payment";

const OrganizationBillingOverview = () => {
	const [addPaymentDetailsOpen, setAddPaymentDetailsOpen] = useState(false);

	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-12">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<p className="font-semibold">Credit remaining</p>
							<p className="text-4xl font-semibold">$0.00</p>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="default"
								onClick={() => setAddPaymentDetailsOpen(true)}
							>
								Add payment details
							</Button>
							<Button variant="outline">
								<Link to="/dashboard">View usage</Link>
							</Button>
						</div>
						{addPaymentDetailsOpen && <StripePayment />}
					</div>
					<div className="grid grid-cols-2 gap-x-36 gap-y-10 w-fit">
						<Link
							className="flex items-center gap-4 hover:cursor-pointer"
							to="/organization/billing/payment-methods"
						>
							<div className="p-4 rounded-md border bg-card-gradient">
								<CreditCard size={20} />
							</div>
							<div>
								<p className="font-medium">Payment method</p>
								<p className="text-sm text-gray-500">
									Add or change payment method
								</p>
							</div>
						</Link>
						<Link
							className="flex items-center gap-4 hover:cursor-pointer"
							to="/organization/billing/billing-history"
						>
							<div className="p-4 rounded-md border bg-card-gradient">
								<CreditCard size={20} />
							</div>
							<div>
								<p className="font-medium">Billing history</p>
								<p className="text-sm text-gray-500">
									View your past invoices and payment records
								</p>
							</div>
						</Link>
						<Link
							className="flex items-center gap-4 hover:cursor-pointer"
							to="/organization/billing/preferences"
						>
							<div className="p-4 rounded-md border bg-card-gradient">
								<CreditCard size={20} />
							</div>
							<div>
								<p className="font-medium">Preferences</p>
								<p className="text-sm text-gray-500">
									Manage billing information
								</p>
							</div>
						</Link>
						<Link
							className="flex items-center gap-4 hover:cursor-pointer"
							to="/dashboard"
						>
							<div className="p-4 rounded-md border bg-card-gradient">
								<CreditCard size={20} />
							</div>
							<div>
								<p className="font-medium">Usage limits</p>
								<p className="text-sm text-gray-500">
									Set limits on your usage to manage costs
								</p>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingOverview;
