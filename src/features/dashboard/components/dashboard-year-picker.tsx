import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/shadcn/popover";
import { YearPicker } from "@/components/shadcn/yearpicker";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { vi } from "react-day-picker/locale/vi";
import { enUS } from "react-day-picker/locale/en-US";

const DashboardYearPicker = () => {
	const { t } = useTranslation("dashboard");
	const { i18n } = useTranslation();
	const currentLocale = i18n.language || "en-US";

	const [year, setYear] = useState<Date>();

	return (
		<Field className="mx-auto w-44">
			<FieldLabel htmlFor="year-picker-simple">
				{t("yearPicker.label")}
			</FieldLabel>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant={"outline"}
						className={cn(
							"w-[280px] justify-start text-left font-normal",
							!year && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{year ? (
							format(year, "yyyy", {
								locale: currentLocale === "vi" ? vi : enUS,
							})
						) : (
							<span>{t("yearPicker.placeholder")}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<YearPicker onYearSelect={setYear} selectedYear={year} />
				</PopoverContent>
			</Popover>
		</Field>
	);
};

export default DashboardYearPicker;
