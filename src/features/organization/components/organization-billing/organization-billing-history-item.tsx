import { SquareArrowOutUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BillingHistory } from "../../types/billing";
import { useGetInvoiceDetails } from "../../hooks/organization-billing/use-get-invoice-details";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";

const formatDate = (value: string, locale: string) => {
	const date = new Date(value);

	return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale);
};

const formatAmount = (value: string, locale: string) => {
	const amount = Number(value);

	if (Number.isNaN(amount)) {
		return value;
	}

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
	}).format(amount);
};

interface InvoiceDetailsDialogProps {
	invoiceId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const InvoiceDetailsDialog = ({
	invoiceId,
	open,
	onOpenChange,
}: InvoiceDetailsDialogProps) => {
	const { data: invoiceResponse } = useGetInvoiceDetails(invoiceId);
	const { i18n } = useTranslation("billing");
	const locale = i18n.language;
	const invoice = invoiceResponse?.data;

	const lineItemsTotal = invoice?.lineItems?.reduce(
		(sum, item) => sum + Number(item.amount),
		0
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Invoice details</DialogTitle>
					<p className="text-xs text-muted-foreground font-mono">
						{invoice?.invoiceUID}
					</p>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">Billing period</p>
						<p className="text-sm font-medium">
							{invoice?.billingPeriod
								? formatDate(invoice.billingPeriod, locale)
								: "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">Paid at</p>
						<p className="text-sm font-medium">
							{invoice?.paidAt ? formatDate(invoice.paidAt, locale) : "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">Total amount</p>
						<p className="text-sm font-medium">
							{invoice?.totalAmount
								? formatAmount(invoice.totalAmount, locale)
								: "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">Used credits</p>
						<p className="text-sm font-medium">{invoice?.usedCredits ?? "—"}</p>
					</div>
				</div>

				{invoice?.lineItems && invoice.lineItems.length > 0 && (
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
							Line items
						</p>
						<div className="rounded-md border overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Description</TableHead>
										<TableHead>Project</TableHead>
										<TableHead className="text-right">Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoice.lineItems.map((item, index) => (
										<TableRow key={item.projectUID ?? index}>
											<TableCell className="truncate max-w-[160px]">
												{item.description}
											</TableCell>
											<TableCell className="text-muted-foreground truncate max-w-[120px]">
												{item.projectUID}
											</TableCell>
											<TableCell className="text-right">
												{formatAmount(item.amount, locale)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell colSpan={2} className="font-medium">
											Total
										</TableCell>
										<TableCell className="text-right font-medium">
											{formatAmount(String(lineItemsTotal ?? 0), locale)}
										</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
const OrganizationBillingHistoryItem = ({
	invoice,
}: {
	invoice: BillingHistory["data"][number];
}) => {
	const { t, i18n } = useTranslation("billing" as any);
	const locale = i18n.language;

	const [detailsOpen, setDetailsOpen] = useState(false);

	return (
		<>
			<div className="relative w-full flex items-start justify-between gap-4 rounded-lg border bg-card px-10 py-6 shadow-sm">
				<div className="flex min-w-0 flex-1 flex-col">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="truncate font-medium mb-1">
								{t("historyItem.invoiceId")}: {invoice.invoiceUID}
							</p>
							<div className="flex items-center gap-x-4">
								<p className="text-sm text-muted-foreground">
									{t("historyItem.billingPeriod")}: {invoice.billingPeriod}
								</p>
								<div className="border-l h-4" />
								<p className="text-sm text-muted-foreground">
									{t("historyItem.paid")}: {formatDate(invoice.paidAt, locale)}
								</p>
							</div>
						</div>
						<div className="flex-0">
							<p className="text-sm font-semibold text-nowrap mb-1">
								{t("historyItem.totalAmount")}:{" "}
								{formatAmount(invoice.totalAmount, locale)}
							</p>
							<p className="text-sm font-semibold text-nowrap">
								{t("historyItem.usedCredits")}: {invoice.usedCredits}
							</p>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						{invoice.details.additionalProperty}
					</p>
				</div>

				<Button
					type="button"
					size="icon"
					className="group absolute -top-2 -right-2 p-2 border bg-background rounded-sm cursor-pointer transition-colors duration-500 hover:bg-primary"
					onClick={() => setDetailsOpen(true)}
				>
					<SquareArrowOutUpRight
						size={16}
						className="shrink-0 text-black transition-colors group-hover:text-white"
					/>
				</Button>
			</div>
			{detailsOpen && (
				<InvoiceDetailsDialog
					invoiceId={invoice.invoiceUID}
					open={detailsOpen}
					onOpenChange={setDetailsOpen}
				/>
			)}
		</>
	);
};

export default OrganizationBillingHistoryItem;
