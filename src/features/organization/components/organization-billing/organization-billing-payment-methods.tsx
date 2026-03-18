import { TriangleAlert } from "lucide-react";

const OrganizationBillingPaymentMethods = () => {
	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center gap-4 border border-alert rounded-lg p-4">
					<TriangleAlert size={20} className="text-alert" />
					<div className="flex flex-col gap-1 text-alert">
						<p className="font-semibold text-sm">
							You have not started a billing plan yet
						</p>
						<p className="font-normal text-sm">
							To add a payment method and start paying for API usage, go to the
							Billing overview page and select "Add payment details" to
							continue.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingPaymentMethods;
