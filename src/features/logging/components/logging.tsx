import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetLog } from "../hooks/use-get-log";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { toLokiQuery } from "../utils/loki";
import { normalizeDayRange } from "../utils/date-range";
import type { OrganizationProject } from "@/features/organization/organization.type";
import type { LoggingResponse } from "../types/logging";
import LoggingHeader from "./logging-header";
import LoggingTable from "./logging-table";

const Logging = (): React.JSX.Element => {
	const { t, i18n } = useTranslation("logging");
	const organizationId = useAuthStore((state) => state?.organization?.id ?? "");

	// Mặc định: trọn vẹn 24h của ngày hôm nay
	const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
		() => normalizeDayRange(new Date())
	);

	const [limit, setLimit] = useState("100");
	const [direction, setDirection] = useState("backward");
	const [customQuery, setCustomQuery] = useState("");
	const [filters, setFilters] = useState("");

	const debouncedQuery = useDebounce(customQuery, 300);
	const lokiQuery = toLokiQuery(debouncedQuery);

	const { data: projectsData } = useGetOrganizationProjects({
		organizationId,
		limit: 100,
	});

	const projects = useMemo(
		() => (projectsData?.results as OrganizationProject[] | undefined) ?? [],
		[projectsData?.results]
	);

	const {
		data: logs,
		refetch,
		isFetching,
	} = useGetLog({
		start: dateRange.start,
		end: dateRange.end,
		limit: limit ? Number(limit) : undefined,
		direction: direction as "forward" | "backward" | undefined,
		custom_query: lokiQuery,
		filters: filters || undefined,
	});

	const logData = useMemo(
		() => (logs as LoggingResponse | undefined) ?? [],
		[logs]
	);

	// Giữ tham chiếu ổn định cho picker
	const pickerRange = useMemo<DateRange>(
		() => ({
			from: new Date(dateRange.start),
			to: new Date(dateRange.end),
		}),
		[dateRange.start, dateRange.end]
	);

	const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
		if (!range?.from) {
			// Người dùng clear -> quay về hôm nay
			setDateRange(normalizeDayRange(new Date()));
			return;
		}
		setDateRange(normalizeDayRange(range.from, range.to));
	}, []);

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">{t("heading")}</h2>
			<LoggingHeader
				dateRange={pickerRange}
				onDateRangeChange={handleDateRangeChange}
				limit={limit}
				onLimitChange={setLimit}
				direction={direction}
				onDirectionChange={setDirection}
				customQuery={customQuery}
				onCustomQueryChange={setCustomQuery}
				filters={filters}
				onFiltersChange={setFilters}
				projects={projects}
				isRefreshing={isFetching}
				onRefresh={() => refetch()}
			/>
			<LoggingTable data={logData} locale={i18n.language || "en"} />
		</div>
	);
};

export default Logging;
