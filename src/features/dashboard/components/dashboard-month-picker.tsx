import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { MonthPicker } from "@/components/shadcn/monthpicker";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { vi } from "react-day-picker/locale/vi";
import { enUS } from "react-day-picker/locale/en-US";

const DashboardMonthPicker = () => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const [month, setMonth] = useState<Date>();

	return (
		<Field className="mx-auto w-44">
			<FieldLabel htmlFor="date-picker-simple">
				{t("monthPicker.label")}
			</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-[280px] justify-start text-left font-normal",
							!month && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{month ? (
							format(month, "MMM yyyy", {
								locale: currentLocale === "vi" ? vi : enUS,
							})
						) : (
							<span>{t("monthPicker.placeholder")}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<MonthPicker onMonthSelect={setMonth} selectedMonth={month} />
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardMonthPicker;
