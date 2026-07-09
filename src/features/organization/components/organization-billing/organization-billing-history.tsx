import OrganizationBillingHistoryItem from "./organization-billing-history-item";

import { useGetInvoices } from "../../hooks/organization-billing/use-get-invoices";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import { Label } from "@/components/shadcn/label";
import PermissionDeniedBlock from "@/components/permission-block/permission-denied-block";

const OrganizationBillingHistory = () => {
	const { t } = useTranslation("billing");
	const [paid, setPaid] = useState(false);

	const { data: invoices, isError } = useGetInvoices({ paid });

	if (isError) {
		return <PermissionDeniedBlock />;
	}

	return (
		<motion.div
			className="w-full py-10"
			variants={itemVariants}
			initial="hidden"
			animate="visible"
		>
			<div className="max-w-3xl mx-auto">
				<div className="mb-6 flex items-center justify-start gap-x-4">
					<Label htmlFor="billing-history-filter">
						{t("history.filterLabel")}
					</Label>
					<Select
						value={paid ? "paid" : "unpaid"}
						onValueChange={(value) => setPaid(value === "paid")}
					>
						<SelectTrigger className="w-40" id="billing-history-filter">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="unpaid">
								{t("history.filter.unpaid")}
							</SelectItem>
							<SelectItem value="paid">{t("history.filter.paid")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{(!invoices?.data || !invoices?.data.length) && (
					<div className="flex flex-col gap-4">
						<p className="text-sm">{t("history.period")}</p>
						<p className="font-medium text-muted-foreground text-md">
							{t("history.noInvoices")}
						</p>
					</div>
				)}
				<div className="flex flex-col items-center gap-y-4">
					{invoices?.data?.map((invoice) => (
						<OrganizationBillingHistoryItem
							key={invoice.invoiceUID}
							invoice={invoice}
						/>
					))}
				</div>
			</div>
		</motion.div>
	);
};

export default OrganizationBillingHistory;
