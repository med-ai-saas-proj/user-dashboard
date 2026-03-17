import { Progress } from "@/components/shadcn/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";

const credits = [
	{
		received: "2024-01-10",
		state: "Active",
		balance: "$250.00",
		expires: "2025-01-10",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-02-05",
		state: "Pending",
		balance: "$150.00",
		expires: "2025-02-05",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-03-12",
		state: "Expired",
		balance: "$350.00",
		expires: "2024-09-12",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-04-01",
		state: "Active",
		balance: "$450.00",
		expires: "2025-04-01",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-05-22",
		state: "Active",
		balance: "$550.00",
		expires: "2025-05-22",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-06-14",
		state: "Pending",
		balance: "$200.00",
		expires: "2025-06-14",
		isAvailable: Math.random() > 0.5,
	},
	{
		received: "2024-07-30",
		state: "Expired",
		balance: "$300.00",
		expires: "2024-12-30",
		isAvailable: Math.random() > 0.5,
	},
];

const OrganizationBillingCreditGrants = () => {
	const haveCredits = true;

	return (
		<div className="w-full py-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex flex-col gap-6">
					<div className="flex items-center justify-between text-sm">
						<p className="font-semibold">Credit Grants</p>
						<p className="text-muted-foreground font-semibold">USD</p>
					</div>
					{!haveCredits && (
						<p className="font-normal text-muted-foreground text-sm">
							No credit grants found.
						</p>
					)}
					{haveCredits && (
						<>
							<div className="flex items-center gap-x-4 mb-6">
								<Progress
									value={75}
									className="w-full h-4 rounded-none bg-muted"
								/>
								<div className="flex items-center gap-x-0.5 font-semibold">
									<p>$0.00</p>
									<p>/</p>
									<p>$100.00</p>
								</div>
							</div>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>RECEIVED</TableHead>
										<TableHead>STATE</TableHead>
										<TableHead>BALANCE</TableHead>
										<TableHead>EXPIRES</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{credits.map((credit) => (
										<TableRow key={credit.received}>
											<TableCell>{credit.received}</TableCell>
											<TableCell>
												<p className="font-semibold text-successful bg-successful-status w-fit px-2 py-1 rounded-sm">
													{credit.state}
												</p>
											</TableCell>
											<TableCell>{credit.balance}</TableCell>
											<TableCell>{credit.expires}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingCreditGrants;
