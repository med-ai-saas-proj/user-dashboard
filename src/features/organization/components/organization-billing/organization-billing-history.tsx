import OrganizationBillingHistoryItem from "./organization-billing-history-item";

import { useGetInvoices } from "../../hooks/organization-billing/use-get-invoices";
import { useTranslation } from "react-i18next";

const OrganizationBillingHistory = () => {
	const { t } = useTranslation("billing" as any);
	const { data: invoices } = useGetInvoices({
		paid: true,
	});

	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
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
		</div>
	);
};

export default OrganizationBillingHistory;
