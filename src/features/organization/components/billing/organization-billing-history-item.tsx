import { SquareArrowOutUpRight } from "lucide-react";

const OrganizationBillingHistoryItem = () => {
	return (
		<div className="flex items-center justify-between py-4 border-t last:border-b">
			<div className="flex flex-col gap-1">
				<div className="flex items-center gap-1">
					<p>Invoice:</p>
					<p>Jan 1, 2024</p>
				</div>
				<div className="flex items-center gap-1 text-muted-foreground text-sm">
					<p>Paid:</p>
					<p>Jan 1, 2024</p>
				</div>
			</div>
			<SquareArrowOutUpRight size={16} />
		</div>
	);
};

export default OrganizationBillingHistoryItem;
