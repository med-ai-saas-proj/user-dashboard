import { ArrowDown, ArrowUp } from "lucide-react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import type { StatCardData } from "../dashboard.type";
import { FormatValue } from "../utils/format-stat.utils";
import { useTranslation } from "react-i18next";
import { useGetKPICard } from "../hooks/use-get-kpi-card";

const KPICard = () => {
	const { t } = useTranslation("dashboard");

	const { data } = useGetKPICard();

	return (
		<div className="flex gap-4 flex-col md:flex-row">
			{data?.map((stat: StatCardData) => {
				const formattedValue = FormatValue(
					stat.value,
					stat.format || "compact"
				);
				return (
					<Card key={stat.title} className="w-full">
						<CardHeader>
							<CardTitle>
								<p className="font-medium text-muted-foreground">
									{t(`kpiCard.${stat.title}`)}
								</p>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="font-bold text-4xl">{formattedValue}</p>
						</CardContent>
						<CardFooter>
							<div className="flex items-center">
								{stat.change?.type === "increase" ? (
									<ArrowUp className="mr-1 text-muted-foreground" size={16} />
								) : (
									<ArrowDown className="mr-1 text-muted-foreground" size={16} />
								)}
								<p className="text-muted-foreground">
									{stat.change?.value}%{" "}
									{t(`kpiCard.change.${stat.change?.compareLabel}`)}
								</p>
							</div>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
};

export default KPICard;
