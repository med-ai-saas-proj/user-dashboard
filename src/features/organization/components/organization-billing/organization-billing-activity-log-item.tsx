import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { cn, formatIsoToLocaleDateTime } from "@/lib/utils";
import { useGetTransactionDetails } from "../../hooks/organization-billing/use-get-transaction-details";
import type { BillingTransactions } from "../../types/billing";

type ActivityLogItemProps = {
	transactionId: string;
	transaction: BillingTransactions["data"][number];
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

const OrganizationBillingActivityLogItem = ({
	transactionId,
	transaction,
}: ActivityLogItemProps) => {
	const { t, i18n } = useTranslation("billing");
	const [isExpanded, setIsExpanded] = useState(false);
	const locale = i18n.language;

	const {
		data: transactionDetails,
		isPending: isDetailsPending,
		isError: isDetailsError,
	} = useGetTransactionDetails(isExpanded ? transactionId : "");

	const status = transaction.status?.toLowerCase() || "unknown";

	return (
		<div className="w-full rounded-lg border bg-card p-6 shadow-sm">
			<div className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="truncate font-semibold">
							{t("activityLog.item.transactionId")}:{" "}
							{transaction.transaction_uid}
						</p>
						<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
							<p>
								{t("activityLog.item.projectId")}: {transaction.project_uid}
							</p>
							<span className="h-4 border-l" />
							<p>
								{t("activityLog.item.capturedAt")}:{" "}
								{formatIsoToLocaleDateTime(
									transaction.captured_at,
									locale,
									"long"
								)}
							</p>
						</div>
					</div>

					<div className="flex shrink-0 flex-col items-end gap-2">
						<p className="font-semibold">
							{formatAmount(transaction.amount, locale)}
						</p>
						<span
							className={cn(
								"rounded-sm px-2 py-1 text-xs font-medium",
								status === "succeeded" &&
									"bg-successful-status text-successful",
								status !== "succeeded" &&
									"bg-secondary text-secondary-foreground"
							)}
						>
							{transaction.status}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-between gap-4 border-t pt-4">
					<p className="text-sm text-muted-foreground truncate">
						{transaction.details.additionalProperty ||
							t("activityLog.item.noDescription")}
					</p>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded((prev) => !prev)}
					>
						{isExpanded ? (
							<EyeOff className="mr-2 h-4 w-4" />
						) : (
							<Eye className="mr-2 h-4 w-4" />
						)}
						{isExpanded
							? t("activityLog.item.hideDetails")
							: t("activityLog.item.viewDetails")}
					</Button>
				</div>

				{isExpanded && (
					<div className="rounded-md border bg-muted/30 p-4">
						{isDetailsPending && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Spinner className="h-4 w-4" />
								{t("activityLog.loadingDetails")}
							</div>
						)}

						{!isDetailsPending && isDetailsError && (
							<p className="text-sm text-alert">
								{t("activityLog.errorDetails")}
							</p>
						)}

						{!isDetailsPending &&
							!isDetailsError &&
							transactionDetails?.data && (
								<div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
									<p>
										<span className="text-muted-foreground">
											{t("activityLog.details.transactionDate")}:
										</span>
										{formatIsoToLocaleDateTime(
											transactionDetails.data.date,
											locale,
											"long"
										)}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("activityLog.details.capturedAt")}:
										</span>
										{formatIsoToLocaleDateTime(
											transactionDetails.data.captured_at,
											locale,
											"long"
										)}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("activityLog.details.projectId")}:
										</span>
										{transactionDetails.data.project_uid}
									</p>
									<p>
										<span className="text-muted-foreground">
											{t("activityLog.details.status")}:
										</span>
										{transactionDetails.data.status}
									</p>
									<p className="sm:col-span-2">
										<span className="text-muted-foreground">
											{t("activityLog.details.description")}:
										</span>
										{transactionDetails.data.details.additionalProperty ||
											t("activityLog.item.noDescription")}
									</p>
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
};

export default OrganizationBillingActivityLogItem;
