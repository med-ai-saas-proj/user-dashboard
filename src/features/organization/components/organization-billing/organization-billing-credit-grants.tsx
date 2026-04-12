import { useState } from "react";
// import { Progress } from "@/components/shadcn/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { TriangleAlert } from "lucide-react";
import { useGetCredits } from "../../hooks/organization-billing/use-get-credit";
import { useGetCreditTransactions } from "../../hooks/organization-billing/use-get-credit-transactions";
// import AddCreditDialog from "./dialogs/add-credit-dialog";
import { formatIsoToLocaleDateTime } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";

const OrganizationBillingCreditGrants = () => {
	const { t, i18n } = useTranslation("billing");
	const lang = i18n.language;

	const limit = 1;
	const [page, setPage] = useState(1);

	const { data: currentCreditsInOrganization } = useGetCredits();
	const {
		data: creditTransactions,
		isPending,
		isFetching,
	} = useGetCreditTransactions({
		offset: 0,
		limit: page * limit,
	});
	const haveCredits =
		currentCreditsInOrganization?.data &&
		Number(currentCreditsInOrganization.data.amount) > 0;
	const totalPages = creditTransactions
		? Math.ceil(creditTransactions.total / limit)
		: 0;
	const isInitialLoading = isPending && !creditTransactions;
	const isLoadingMore = isFetching && !!creditTransactions;

	const handleLoadMore = () => {
		if (!creditTransactions) return;
		if (page >= totalPages) return;

		setPage((prev) => prev + 1);
	};

	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-6">
					{!haveCredits && (
						<div className="flex items-center gap-4 border border-alert rounded-lg p-4">
							<TriangleAlert size={20} className="text-alert" />
							<div className="flex flex-col gap-1 text-alert">
								<p className="font-semibold text-sm">
									{t("creditGrants.empty.title")}
								</p>
								<p className="text-sm">{t("creditGrants.empty.description")}</p>
							</div>
							{/* <AddCreditDialog
								triggerElement={
									<Button className="w-32 bg-alert hover:bg-alert/80 ml-auto">
										{t("creditGrants.empty.addCredit")}
									</Button>
								}
							/> */}
						</div>
					)}
					{haveCredits && (
						<>
							{/* <div className="flex items-center justify-between text-sm">
                                <p className="font-semibold">Credit Grants</p>
                                <p className="text-muted-foreground font-semibold">
                                    USD
                                </p>
                            </div>
                            <div className="flex items-center gap-x-4 mb-6">
                                <Progress
                                    value={0}
                                    className="w-full h-4 rounded-none bg-muted"
                                />
                                <div className="flex items-center gap-x-0.5 font-semibold">
                                    <p>$0.00</p>
                                    <p>/</p>
                                    <p>
                                        $
                                        {Number(
                                            currentCreditsInOrganization.data
                                                .amount,
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            </div> */}
							<div className="flex items-center gap-x-4">
								<p className="uppercase font-semibold">
									{t("creditGrants.currentCredits")}
								</p>
								<p className="font-semibold px-2 py-1 bg-successful-status text-successful rounded-sm">
									${Number(currentCreditsInOrganization.data.amount).toFixed(2)}
								</p>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("creditGrants.table.received")}</TableHead>
										<TableHead>{t("creditGrants.table.amount")}</TableHead>
										<TableHead>{t("creditGrants.table.description")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{creditTransactions?.data.map((credit) => (
										<TableRow
											key={
												credit.amount + credit.created_at + credit.description
											}
										>
											<TableCell>
												{formatIsoToLocaleDateTime(
													credit.created_at,
													lang,
													"long"
												)}
											</TableCell>
											<TableCell>
												<p className="font-semibold text-successful bg-successful-status w-fit px-2 py-1 rounded-sm">
													${Number(credit.amount).toFixed(2)}
												</p>
											</TableCell>
											<TableCell>{credit.description}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<div className="w-full mt-8 flex items-center justify-center">
								{isInitialLoading && <Spinner className="my-4" />}
								{!isInitialLoading && page < totalPages && (
									<Button
										variant="secondary"
										onClick={handleLoadMore}
										disabled={isLoadingMore}
									>
										{isLoadingMore && <Spinner className="mr-2" />}
										{isLoadingMore
											? t("creditGrants.loading")
											: t("creditGrants.loadMore")}
									</Button>
								)}
								{!isInitialLoading && !isLoadingMore && page >= totalPages && (
									<p className="text-sm text-muted-foreground">
										{t("creditGrants.noTransactions")}
									</p>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingCreditGrants;
