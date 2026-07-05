import { useCallback, useMemo, useState } from "react";
import type { OrganizationProject } from "@/features/organization/organization.type";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { FilterIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DashboardAggregateProjectFilterProps {
	organizationId: string;
	value: string[];
	onChange: (projectUids: string[]) => void;
}

const MAX_VISIBLE_PROJECTS = 5;

const DashboardAggregateProjectFilter = ({
	organizationId,
	value,
	onChange,
}: DashboardAggregateProjectFilterProps): React.JSX.Element => {
	const { t } = useTranslation("dashboard");
	const [open, setOpen] = useState(false);

	const { data: projectsData } = useGetOrganizationProjects({
		organizationId,
		limit: 100,
	});

	const projects = useMemo(
		() => (projectsData?.results as OrganizationProject[] | undefined) ?? [],
		[projectsData?.results]
	);

	const selectedProjects = useMemo(
		() => projects.filter((p) => value.includes(p.project_uuid)),
		[projects, value]
	);

	const isAllSelected = projects.length > 0 && value.length === projects.length;

	const handleToggle = useCallback(
		(projectUuid: string) => {
			const next = value.includes(projectUuid)
				? value.filter((id) => id !== projectUuid)
				: [...value, projectUuid];
			onChange(next);
		},
		[value, onChange]
	);

	const handleToggleAll = useCallback(() => {
		if (isAllSelected) {
			onChange([]);
		} else {
			onChange(projects.map((p) => p.project_uuid));
		}
	}, [isAllSelected, projects, onChange]);

	const displayText = useMemo(() => {
		if (value.length === 0) return t("projectFilter.noProjects");
		if (value.length === projects.length)
			return t("projectFilter.allProjects", { count: value.length });

		const visible = selectedProjects.slice(0, MAX_VISIBLE_PROJECTS);
		const overflow = selectedProjects.length - MAX_VISIBLE_PROJECTS;
		const names = visible.map((p) => p.name).join(", ");

		return overflow > 0
			? `${names} ${t("projectFilter.overflow", { count: overflow })}`
			: names;
	}, [value.length, projects.length, selectedProjects, t]);

	return (
		<div className="flex flex-col items-start gap-2">
			<p className="text-base font-medium whitespace-nowrap">
				{t("projectFilter.dialogTitle")}
			</p>
			<div className="flex items-center gap-2">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							aria-label={t("projectFilter.filterLabel")}
						>
							<FilterIcon className="size-4" />
							{t("projectFilter.selectLabel")}
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>{t("projectFilter.dialogTitle")}</DialogTitle>
						</DialogHeader>
						<div className="flex flex-col gap-1">
							{/* Select All */}
							<div className="flex items-center gap-2 px-1 py-4 border-b">
								<Checkbox
									id="select-all-projects"
									checked={isAllSelected}
									onCheckedChange={handleToggleAll}
								/>
								<Label
									htmlFor="select-all-projects"
									className="font-medium cursor-pointer"
								>
									{t("projectFilter.selectAll")}
								</Label>
							</div>

							{/* Project List */}
							<div className="flex flex-col gap-1 max-h-80 overflow-y-auto pt-1">
								{projects.map((project) => (
									<div
										key={project.project_uuid}
										className="flex items-start gap-2 px-1 py-2 rounded-sm hover:bg-accent transition-colors"
									>
										<Checkbox
											id={project.project_uuid}
											checked={value.includes(project.project_uuid)}
											onCheckedChange={() => handleToggle(project.project_uuid)}
											className="mt-1"
										/>
										<Label
											htmlFor={project.project_uuid}
											className="flex flex-col items-start p-0.5 cursor-pointer"
										>
											<span className="text-sm font-medium leading-tight">
												{project.name}
											</span>
											<span className="text-xs text-muted-foreground break-all">
												{project.project_uuid}
											</span>
										</Label>
									</div>
								))}
							</div>
						</div>
					</DialogContent>
				</Dialog>
				<span className="text-base text-muted-foreground truncate max-w-[280px]">
					{displayText}
				</span>
			</div>
		</div>
	);
};

export default DashboardAggregateProjectFilter;
