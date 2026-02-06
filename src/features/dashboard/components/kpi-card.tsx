import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { FormatValue } from "../utils/format-stat.utils";

type KPICardProps = {
	title: string;
	value: number;
	changedValue: string;
};

const KPICard = ({ title, value, changedValue }: KPICardProps) => {
	const formattedValue = FormatValue(value, "compact");

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<p className="font-medium text-muted-foreground">{title}</p>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="font-bold text-4xl">{formattedValue}</p>
			</CardContent>
			<CardFooter>
				<p className="text-muted-foreground">{changedValue}</p>
			</CardFooter>
		</Card>
	);
};

export default KPICard;
