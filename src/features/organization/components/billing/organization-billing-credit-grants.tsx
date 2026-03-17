const OrganizationBillingCreditGrants = () => {
	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between text-sm">
						<p className="font-semibold">Credit Grants</p>
						<p className="text-muted-foreground">USD</p>
					</div>
					<p className="font-normal text-muted-foreground text-sm">
						No credit grants found.
					</p>
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingCreditGrants;
