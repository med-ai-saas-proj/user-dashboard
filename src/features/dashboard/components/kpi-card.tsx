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

type KPICardProps = {
	stats: StatCardData;
};

const KPICard = ({ stats }: KPICardProps) => {
	const { t } = useTranslation("dashboard");
	const formattedValue = FormatValue(stats.value, stats.format || "compact");

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<p className="font-medium text-muted-foreground">
						{t(`kpiCard.${stats.title}`)}
					</p>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="font-bold text-4xl">{formattedValue}</p>
			</CardContent>
			<CardFooter>
				<div className="flex items-center">
					{stats.change?.type === "increase" ? (
						<ArrowUp className="mr-1 text-muted-foreground" size={16} />
					) : (
						<ArrowDown className="mr-1 text-muted-foreground" size={16} />
					)}
					<p className="text-muted-foreground">
						{stats.change?.value}%{" "}
						{t(`kpiCard.change.${stats.change?.compareLabel}`)}
					</p>
				</div>
			</CardFooter>
		</Card>
	);
};

export default KPICard;
