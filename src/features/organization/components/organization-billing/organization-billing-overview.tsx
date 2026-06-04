import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/shadcn/button";
import { CreditCard } from "lucide-react";
import AddPaymentDetailsDialog from "./dialogs/add-payment-details-dialog";
import UpdatePaymentDetailsDialog from "./dialogs/update-payment-details-dialog";
import { useBillingStore } from "../../store/billing";
import OrganizationBillingSources from "./organization-billing-sources";
import StripePayment from "./stripe/stripe-payment";
import { useTranslation } from "react-i18next";
import { useGetCredits } from "../../hooks/organization-billing/use-get-credit";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

const OrganizationBillingOverview = () => {
	const { t } = useTranslation("billing");
	const [addPaymentDetailsOpen, setAddPaymentDetailsOpen] = useState(false);
	const [updatePaymentDetailsOpen, setUpdatePaymentDetailsOpen] =
		useState(false);
	const [stripePay, setStripePay] = useState(false);
	const billingSourceId = useBillingStore((state) => state.billingSourceId);

	const { data: currentCreditsInOrganization } = useGetCredits();

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={itemVariants}
			className="w-full py-10"
		>
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-12">
					<div className="flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<p className="font-semibold">{t("overview.creditRemaining")}</p>
							<p className="text-4xl font-semibold">
								${currentCreditsInOrganization?.data?.amount ?? "0.00"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{billingSourceId && (
								<Button
									variant="default"
									onClick={() => setStripePay(true)}
									disabled={stripePay}
								>
									{t("overview.actions.payWithStripe")}
								</Button>
							)}
							{billingSourceId && (
								<Button
									variant="default"
									onClick={() => setUpdatePaymentDetailsOpen(true)}
								>
									{t("overview.actions.updatePaymentDetails")}
								</Button>
							)}
							{!billingSourceId && (
								<Button
									variant="default"
									onClick={() => setAddPaymentDetailsOpen(true)}
								>
									{t("overview.actions.addPaymentDetails")}
								</Button>
							)}
							<Button variant="outline">
								<Link to="/dashboard">{t("overview.actions.viewUsage")}</Link>
							</Button>
						</div>
						{stripePay && (
							<div className="border-b pb-4">
								<StripePayment />
							</div>
						)}
						{billingSourceId && (
							<UpdatePaymentDetailsDialog
								open={updatePaymentDetailsOpen}
								onOpenChange={setUpdatePaymentDetailsOpen}
							/>
						)}
						{!billingSourceId && (
							<AddPaymentDetailsDialog
								open={addPaymentDetailsOpen}
								onOpenChange={setAddPaymentDetailsOpen}
							/>
						)}
					</div>
					<OrganizationBillingSources />
					<div className="grid grid-cols-2 gap-x-36 gap-y-10 w-fit">
						<Link
							className="flex items-center gap-4 hover:cursor-pointer"
							to="/organization/billing/payment-methods"
						>
							<div className="p-4 rounded-md border bg-card-gradient">
								<CreditCard size={20} />
							</div>
							<div>
								<p className="font-medium">
									{t("overview.cards.paymentMethod.title")}
								</p>
								<p className="text-sm text-gray-500">
									{t("overview.cards.paymentMethod.description")}
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
								<p className="font-medium">
									{t("overview.cards.billingHistory.title")}
								</p>
								<p className="text-sm text-gray-500">
									{t("overview.cards.billingHistory.description")}
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
								<p className="font-medium">
									{t("overview.cards.preferences.title")}
								</p>
								<p className="text-sm text-gray-500">
									{t("overview.cards.preferences.description")}
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
								<p className="font-medium">
									{t("overview.cards.usageLimits.title")}
								</p>
								<p className="text-sm text-gray-500">
									{t("overview.cards.usageLimits.description")}
								</p>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default OrganizationBillingOverview;
