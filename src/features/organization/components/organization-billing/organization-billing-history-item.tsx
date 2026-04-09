import { SquareArrowOutUpRight } from "lucide-react";
import type { BillingHistory } from "../../types/billing";

const formatDate = (value: string) => {
	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatAmount = (value: string) => {
	const amount = Number(value);

	if (Number.isNaN(amount)) {
		return value;
	}

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
};

const OrganizationBillingHistoryItem = ({
	invoice,
}: {
	invoice: BillingHistory["data"][number];
}) => {
	return (
		<div className="relative w-full flex items-start justify-between gap-4 rounded-lg border bg-card p-6 shadow-sm">
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="truncate font-medium">
							Invoice ID: {invoice.invoiceUID}
						</p>
						<div className="flex items-center gap-x-4">
							<p className="text-sm text-muted-foreground">
								Billing period: {invoice.billingPeriod}
							</p>
							<div className="border-l h-4" />
							<p className="text-sm text-muted-foreground">
								Paid: {formatDate(invoice.paidAt)}
							</p>
						</div>
					</div>
					<div>
						<p className="text-sm font-semibold text-nowrap">
							Total Amount: {formatAmount(invoice.totalAmount)}
						</p>
						<p className="text-sm font-semibold text-nowrap">
							Used credits: {invoice.usedCredits}
						</p>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					{invoice.details.additionalProperty}
				</p>
			</div>

			<div className="absolute -top-3 -right-3 p-2 border bg-background rounded-sm">
				<SquareArrowOutUpRight
					size={16}
					className="shrink-0 text-muted-foreground"
				/>
			</div>
		</div>
	);
};

export default OrganizationBillingHistoryItem;
