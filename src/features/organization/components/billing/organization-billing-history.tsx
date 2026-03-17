// import OrganizationBillingHistoryItem from "./organization-billing-history-item";

const OrganizationBillingHistory = () => {
	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-4">
					<p className="text-sm">Showing invoices within the past 12 months</p>
					<p className="font-medium text-muted-foreground text-md">
						No invoices found
					</p>
				</div>
				{/* <OrganizationBillingHistoryItem /> */}
			</div>
		</div>
	);
};

export default OrganizationBillingHistory;
