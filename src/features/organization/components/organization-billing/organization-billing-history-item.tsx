import { useTranslation } from "react-i18next";
import type { BillingHistory } from "../../types/billing";
import { useGetInvoiceDetails } from "../../hooks/organization-billing/use-get-invoice-details";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/shadcn/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter as TableFooterComp,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { usePayInvoice } from "../../hooks/organization-billing/use-pay-invoice";
import { formatIsoToLocaleDateTime } from "@/lib/utils";

const formatAmount = (value: string, locale: string) => {
	const amount = Number(value);

	if (Number.isNaN(amount)) {
		return value;
	}

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 5,
		maximumFractionDigits: 5,
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
	const { t, i18n } = useTranslation("billing");
	const locale = i18n.language;

	const { data: invoiceResponse } = useGetInvoiceDetails(invoiceId);

	const invoice = invoiceResponse?.data;

	const lineItemsTotal = invoice?.lineItems?.reduce(
		(sum, item) => sum + Number(item.amount),
		0
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{t("historyItem.details.title")}</DialogTitle>
					<p className="text-xs text-muted-foreground font-mono">
						{invoice?.invoiceUID}
					</p>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">
							{t("historyItem.details.billingPeriod")}
						</p>
						<p className="text-sm font-medium">
							{invoice?.billingPeriod
								? formatIsoToLocaleDateTime(invoice.billingPeriod, locale)
								: "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">
							{t("historyItem.details.paidAt")}
						</p>
						<p className="text-sm font-medium">
							{invoice?.paidAt
								? formatIsoToLocaleDateTime(invoice.paidAt, locale)
								: "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">
							{t("historyItem.details.totalAmount")}
						</p>
						<p className="text-sm font-medium">
							{invoice?.totalAmount
								? formatAmount(invoice.totalAmount, locale)
								: "—"}
						</p>
					</div>
					<div className="rounded-md bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-1">
							{t("historyItem.details.usedCredits")}
						</p>
						<p className="text-sm font-medium">
							{invoice?.usedCredits !== undefined
								? Number(invoice.usedCredits).toFixed(5)
								: "—"}
						</p>
					</div>
				</div>

				{invoice?.lineItems && invoice.lineItems.length > 0 && (
					<div>
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
							{t("historyItem.details.lineItems")}
						</p>
						<div className="rounded-md border overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											{t("historyItem.details.description")}
										</TableHead>
										<TableHead>{t("historyItem.details.projectId")}</TableHead>
										<TableHead>
											{t("historyItem.details.projectName")}
										</TableHead>
										<TableHead className="text-right">
											{t("historyItem.details.amount")}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{invoice.lineItems.map((item, index) => (
										<TableRow key={item.projectUID ?? index}>
											<TableCell className="truncate max-w-40">
												{item.description}
											</TableCell>
											<TableCell className="text-muted-foreground truncate max-w-[120px]">
												{item.projectUID}
											</TableCell>
											<TableCell className="text-muted-foreground truncate max-w-[120px]">
												{item.projectName}
											</TableCell>
											<TableCell className="text-right">
												{formatAmount(item.amount, locale)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
								<TableFooterComp>
									<TableRow>
										<TableCell colSpan={2} className="font-medium">
											{t("historyItem.details.total")}
										</TableCell>
										<TableCell className="text-right font-medium">
											{formatAmount(String(lineItemsTotal ?? 0), locale)}
										</TableCell>
									</TableRow>
								</TableFooterComp>
							</Table>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
interface PayInvoiceDialogProps {
	invoice: BillingHistory["data"][number];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const PayInvoiceDialog = ({
	invoice,
	open,
	onOpenChange,
}: PayInvoiceDialogProps) => {
	const { t } = useTranslation("billing");
	const { mutate: payInvoice, isPending } = usePayInvoice();

	const handleConfirm = () => {
		payInvoice(invoice.invoiceUID, {
			onSuccess: (response) => {
				onOpenChange(false);
				const hostedUrl = response.data?.hosted_invoice_url;
				if (hostedUrl) {
					window.open(hostedUrl, "_blank");
				}
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("historyItem.payConfirm.title")}</DialogTitle>
					<DialogDescription>
						{t("historyItem.payConfirm.description")}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2 py-2">
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{t("historyItem.invoiceId")}
						</span>
						<span className="font-medium">{invoice.invoiceUID}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-muted-foreground">
							{t("historyItem.totalAmount")}
						</span>
						<span className="font-medium">
							{formatAmount(invoice.totalAmount, "en")}
						</span>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						{t("common.cancel")}
					</Button>
					<Button type="button" onClick={handleConfirm} disabled={isPending}>
						{isPending
							? t("stripe.processing")
							: t("historyItem.payConfirm.confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

const OrganizationBillingHistoryItem = ({
	invoice,
}: {
	invoice: BillingHistory["data"][number];
}) => {
	const { t, i18n } = useTranslation("billing");
	const locale = i18n.language;

	const [detailsOpen, setDetailsOpen] = useState(false);
	const [payConfirmOpen, setPayConfirmOpen] = useState(false);

	return (
		<>
			<div className="w-full flex flex-col rounded-lg border bg-card px-10 py-6 shadow-sm">
				<div className="flex items-start justify-between gap-4">
					<div className="flex min-w-0 flex-1 flex-col">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="truncate font-medium mb-1">
									{t("historyItem.invoiceId")}: {invoice.invoiceUID}
								</p>
								<div className="flex items-center gap-x-4">
									<p className="text-sm text-muted-foreground">
										{t("historyItem.billingPeriod")}:{" "}
										{formatIsoToLocaleDateTime(invoice.billingPeriod, locale)}
									</p>
									<div className="border-l h-4" />
									<p className="text-sm text-muted-foreground">
										{t("historyItem.paid")}:{" "}
										{invoice.paidAt
											? formatIsoToLocaleDateTime(invoice.paidAt, locale)
											: "—"}
									</p>
								</div>
							</div>
							<div className="flex-0">
								<p className="text-sm font-semibold text-nowrap mb-1">
									{t("historyItem.totalAmount")}:{" "}
									{formatAmount(invoice.totalAmount, locale)}
								</p>
								<p className="text-sm font-semibold text-nowrap">
									{t("historyItem.usedCredits")}:{" "}
									{Number(invoice.usedCredits).toFixed(5)}
								</p>
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							{invoice.details.additionalProperty}
						</p>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setDetailsOpen(true)}
					>
						{t("historyItem.viewDetails")}
					</Button>
					{!invoice.paidAt && (
						<Button
							type="button"
							size="sm"
							onClick={() => setPayConfirmOpen(true)}
						>
							{t("historyItem.payInvoice")}
						</Button>
					)}
				</div>
			</div>
			{detailsOpen && (
				<InvoiceDetailsDialog
					invoiceId={invoice.invoiceUID}
					open={detailsOpen}
					onOpenChange={setDetailsOpen}
				/>
			)}
			<PayInvoiceDialog
				invoice={invoice}
				open={payConfirmOpen}
				onOpenChange={setPayConfirmOpen}
			/>
		</>
	);
};

export default OrganizationBillingHistoryItem;
