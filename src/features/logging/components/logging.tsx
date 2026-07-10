import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetLog } from "../hooks/use-get-log";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { OrganizationProject } from "@/features/organization/organization.type";
import type { LoggingResponse } from "../types/logging";
import LoggingHeader from "./logging-header";
import LoggingTable from "./logging-table";

const Logging = (): React.JSX.Element => {
	const { t, i18n } = useTranslation("logging");
	const organizationId = useAuthStore((state) => state?.organization?.id ?? "");

	const [dateRange, setDateRange] = useState<{
		start: string;
		end: string;
	}>({
		start: "2026-07-09T23:20:00Z",
		end: "2026-07-09T23:23:42Z",
	});

	const [limit, setLimit] = useState("100");
	const [direction, setDirection] = useState("backward");
	const [level, setLevel] = useState("info");
	const [keyword, setKeyword] = useState("");
	const [filters, setFilters] = useState("");

	const { data: projectsData } = useGetOrganizationProjects({
		organizationId,
		limit: 100,
	});

	const projects = useMemo(
		() => (projectsData?.results as OrganizationProject[] | undefined) ?? [],
		[projectsData?.results]
	);

	const { data: logs } = useGetLog({
		start: dateRange.start,
		end: dateRange.end,
		limit: limit ? Number(limit) : undefined,
		direction: direction as "forward" | "backward" | undefined,
		level: level as "info" | "warn" | "error" | "debug" | undefined,
		keyword: keyword || undefined,
		filters: filters || undefined,
	});

	const logData = useMemo(
		() => (logs as LoggingResponse[] | undefined) ?? [],
		[logs]
	);

	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">{t("heading")}</h2>

			<LoggingHeader
				dateRange={
					dateRange.start && dateRange.end
						? {
								from: new Date(dateRange.start),
								to: new Date(dateRange.end),
							}
						: undefined
				}
				onDateRangeChange={(range) => {
					if (range?.from && range?.to) {
						setDateRange({
							start: range.from.toISOString(),
							end: range.to.toISOString(),
						});
					}
				}}
				limit={limit}
				onLimitChange={setLimit}
				direction={direction}
				onDirectionChange={setDirection}
				level={level}
				onLevelChange={setLevel}
				keyword={keyword}
				onKeywordChange={setKeyword}
				filters={filters}
				onFiltersChange={setFilters}
				projects={projects}
			/>

			<LoggingTable data={logData} locale={i18n.language || "en"} />
		</div>
	);
};

export default Logging;
