import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import TimeRangePickerCustom from "@/components/shadcn/timerangepicker-custom";
import OrganizationBillingActivityLogItem from "@/features/organization/components/organization-billing/organization-billing-activity-log-item";
import { useGetTransactionList } from "../../hooks/organization-billing/use-get-transaction-list";
import type { DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";

function OrganizationBillingActivityLog() {
	const { t, i18n } = useTranslation("billing");
	const currentLocale = i18n.language || "en-US";
	const limit = 10;
	const [page, setPage] = useState(1);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

	const formatDateToIso = (date: Date): string => {
		return date.toISOString();
	};

	const {
		data: billingTransactions,
		isPending,
		isFetching,
	} = useGetTransactionList({
		offset: 0,
		limit: page * limit,
		startDate: dateRange?.from ? formatDateToIso(dateRange.from) : undefined,
		endDate: dateRange?.to ? formatDateToIso(dateRange.to) : undefined,
	});

	const handleDateSelect = (selectedDate: DateRange | undefined) => {
		setPage(1);
		if (selectedDate?.from && selectedDate?.to) {
			setDateRange(selectedDate);
		} else if (selectedDate?.from) {
			setDateRange({ from: selectedDate.from, to: selectedDate.from });
		} else {
			setDateRange(undefined);
		}
	};

	const totalPages = billingTransactions
		? Math.ceil(billingTransactions.total / limit)
		: 0;
	const isInitialLoading = isPending && !billingTransactions;
	const isLoadingMore = isFetching && !!billingTransactions;

	const handleLoadMore = () => {
		if (!billingTransactions) return;
		if (page >= totalPages) return;

		setPage((prev) => prev + 1);
	};

	return (
		<motion.div
			className="w-full py-10"
			variants={itemVariants}
			initial="hidden"
			animate="visible"
		>
			<div className="max-w-4xl mx-auto">
				{billingTransactions?.data.length !== undefined &&
					billingTransactions.data.length > 0 && (
						<div className="flex items-center justify-end">
							<TimeRangePickerCustom
								label={t("activityLog.dateRange.label")}
								placeholder={t("activityLog.dateRange.placeholder")}
								onDateChange={handleDateSelect}
								locale={currentLocale === "vi" ? "vi" : "en-US"}
								className="w-fit flex flex-row justify-end text-nowrap mx-0"
							/>
						</div>
					)}
				<div className="flex flex-col gap-6 mt-6">
					{isInitialLoading && (
						<div className="w-full flex items-center justify-center py-8">
							<Spinner />
						</div>
					)}

					{!isInitialLoading && !billingTransactions?.data.length && (
						<p className="text-sm text-muted-foreground text-center py-8">
							{t("activityLog.empty")}
						</p>
					)}

					{!isInitialLoading &&
						billingTransactions?.data.map((transaction) => (
							<OrganizationBillingActivityLogItem
								key={transaction.transaction_uid}
								transactionId={transaction.transaction_uid}
								transaction={transaction}
							/>
						))}

					{!isInitialLoading && billingTransactions && (
						<div className="w-full mt-4 flex items-center justify-center">
							{page < totalPages && (
								<Button
									variant="secondary"
									onClick={handleLoadMore}
									disabled={isLoadingMore}
								>
									{isLoadingMore && <Spinner className="mr-2" />}
									{isLoadingMore
										? t("activityLog.loading")
										: t("activityLog.loadMore")}
								</Button>
							)}

							{page >= totalPages && !!billingTransactions.data.length && (
								<p className="text-sm text-muted-foreground">
									{t("activityLog.noMore")}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}

export default OrganizationBillingActivityLog;
