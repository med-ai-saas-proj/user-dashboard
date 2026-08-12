import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import PermissionDeniedBlock from "@/components/permission-block/permission-denied-block";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { itemVariants } from "@/lib/animations";
import { formatIsoToLocaleDateTime } from "@/lib/utils";
import { useGetCreditAndUsage } from "../../hooks/organization-billing/use-get-credit-and-usage";

const OrganizationBillingUsage = () => {
	const { t, i18n } = useTranslation("billing");
	const lang = i18n.language;

	const {
		usage,
		hasLoaded,
		isLoading,
		isFetching,
		isError,
		loadMore,
		hasMore,
	} = useGetCreditAndUsage();

	const isInitialLoading = isLoading && !hasLoaded;
	const isLoadingMore = isFetching && hasLoaded;
	const hasUsage = usage.length > 0;

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
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-6">
					{!isInitialLoading && !hasUsage && (
						<div className="flex items-center gap-4 border border-alert rounded-lg p-4">
							<TriangleAlert size={20} className="text-alert" />
							<div className="flex flex-col gap-1 text-alert">
								<p className="font-semibold text-sm">
									{t("usage.empty.title")}
								</p>
								<p className="text-sm">{t("usage.empty.description")}</p>
							</div>
						</div>
					)}
					{!isInitialLoading && hasUsage && (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("usage.table.received")}</TableHead>
										<TableHead>{t("usage.table.amount")}</TableHead>
										<TableHead>{t("usage.table.description")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{usage.map((item) => (
										<TableRow
											key={item.amount + item.created_at + item.description}
										>
											<TableCell>
												{formatIsoToLocaleDateTime(
													item.created_at,
													lang,
													"long"
												)}
											</TableCell>
											<TableCell>
												<p className="font-semibold text-alert bg-alert/10 w-fit px-2 py-1 rounded-sm">
													-$
													{Math.abs(Number(item.amount)).toFixed(2)}
												</p>
											</TableCell>
											<TableCell>{item.description}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="w-full mt-8 flex items-center justify-center">
								{isInitialLoading && <Spinner className="my-4" />}
								{!isInitialLoading && hasMore && (
									<Button
										variant="secondary"
										onClick={loadMore}
										disabled={isLoadingMore}
									>
										{isLoadingMore && <Spinner className="mr-2" />}
										{isLoadingMore ? t("usage.loading") : t("usage.loadMore")}
									</Button>
								)}
								{!isInitialLoading && !isLoadingMore && !hasMore && (
									<p className="text-sm text-muted-foreground">
										{t("usage.noTransactions")}
									</p>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default OrganizationBillingUsage;
