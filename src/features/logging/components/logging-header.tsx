import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { FilterIcon, SearchIcon, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import TimeRangePickerCustom from "@/components/shadcn/timerangepicker-custom";
import type { OrganizationProject } from "@/features/organization/organization.type";
import LoggingFilterDialog from "./logging-filter-dialog";

interface LoggingHeaderProps {
	dateRange: DateRange | undefined;
	onDateRangeChange: (range: DateRange | undefined) => void;
	limit: string;
	onLimitChange: (value: string) => void;
	direction: string;
	onDirectionChange: (value: string) => void;
	keyword: string;
	onKeywordChange: (value: string) => void;
	filters: string;
	onFiltersChange: (value: string) => void;
	projects: OrganizationProject[];
	isRefreshing: boolean;
	onRefresh: () => void;
}

const LoggingHeader = ({
	dateRange,
	onDateRangeChange,
	limit,
	onLimitChange,
	direction,
	onDirectionChange,
	keyword,
	onKeywordChange,
	filters,
	onFiltersChange,
	projects,
	isRefreshing,
	onRefresh,
}: LoggingHeaderProps): React.JSX.Element => {
	const { t, i18n } = useTranslation("logging");
	const currentLocale = i18n.language || "en-US";
	const [filterDialogOpen, setFilterDialogOpen] = useState(false);

	return (
		<div className="flex items-end gap-4 mb-6">
			{/* Date Range */}
			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium" id="logging-date-range-label">
					{t("dateRange.label")}
				</span>
				<TimeRangePickerCustom
					label=""
					placeholder={t("dateRange.placeholder")}
					date={dateRange}
					onDateChange={onDateRangeChange}
					locale={currentLocale === "vi" ? "vi" : "en-US"}
					className="w-fit mx-0"
				/>
			</div>

			{/* Limit */}
			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium" id="logging-limit-label">
					{t("limit.label")}
				</span>
				<Select value={limit} onValueChange={onLimitChange}>
					<SelectTrigger className="w-24" aria-labelledby="logging-limit-label">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10</SelectItem>
						<SelectItem value="100">100</SelectItem>
						<SelectItem value="1000">1000</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Direction */}
			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium" id="logging-direction-label">
					{t("direction.label")}
				</span>
				<Select value={direction} onValueChange={onDirectionChange}>
					<SelectTrigger
						className="w-32"
						aria-labelledby="logging-direction-label"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="forward">{t("direction.forward")}</SelectItem>
						<SelectItem value="backward">{t("direction.backward")}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Filter Button */}
			<div className="flex flex-col gap-1.5">
				<Button
					variant="outline"
					onClick={() => setFilterDialogOpen(true)}
					className="gap-2"
					aria-label={t("filter.button")}
				>
					<FilterIcon className="size-4" />
					{t("filter.button")}
					{filters && filters.length > 0 && (
						<span className="size-2 rounded-full bg-primary" />
					)}
				</Button>
			</div>

			<div className="w-full flex items-center justify-end gap-4">
				{/* Refresh Button */}
				<div className="flex flex-col gap-1.5">
					<span className="text-sm font-medium invisible">
						{t("filter.button")}
					</span>
					<Button
						variant="outline"
						onClick={onRefresh}
						disabled={isRefreshing}
						className="gap-2"
						aria-label={t("refresh.button")}
					>
						{isRefreshing ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<RefreshCcw className="size-4" />
						)}
						{t("refresh.button")}
					</Button>
				</div>

				{/* Keyword */}
				<div className="flex flex-col gap-1.5">
					<span className="text-sm font-medium" id="logging-keyword-label">
						{t("keyword.placeholder")}
					</span>
					<div className="relative">
						<SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							id="logging-keyword-input"
							placeholder={t("keyword.placeholder")}
							value={keyword}
							onChange={(e) => onKeywordChange(e.target.value)}
							className="pl-8 w-48"
						/>
					</div>
				</div>
			</div>

			{/* Filter Dialog */}
			<LoggingFilterDialog
				open={filterDialogOpen}
				onOpenChange={setFilterDialogOpen}
				projects={projects}
				currentFilters={filters}
				onSave={onFiltersChange}
			/>
		</div>
	);
};

export default LoggingHeader;
