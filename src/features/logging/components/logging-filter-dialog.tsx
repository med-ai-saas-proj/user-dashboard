import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { OrganizationProject } from "@/features/organization/organization.type";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import { Separator } from "@/components/shadcn/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/shadcn/dialog";

type FilterEntry = {
	type: "projectId" | "level";
	value: string;
};

const LEVELS = ["info", "warn", "error", "debug"] as const;

const parseFilterString = (filters?: string): FilterEntry[] => {
	if (!filters) return [];
	return filters.split(",").reduce<FilterEntry[]>((acc, part) => {
		const [type, ...rest] = part.split(":");
		const value = rest.join(":");
		if ((type === "projectId" || type === "level") && value) {
			acc.push({ type, value });
		}
		return acc;
	}, []);
};

const buildFilterString = (entries: FilterEntry[]): string => {
	return entries.map((e) => `${e.type}:${e.value}`).join(",");
};

interface LoggingFilterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projects: OrganizationProject[];
	currentFilters?: string;
	onSave: (filterString: string) => void;
}

const LoggingFilterDialog = ({
	open,
	onOpenChange,
	projects,
	currentFilters,
	onSave,
}: LoggingFilterDialogProps): React.JSX.Element => {
	const { t } = useTranslation("logging");

	const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
	const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

	// Sync internal state when dialog opens
	useEffect(() => {
		if (open) {
			const entries = parseFilterString(currentFilters);
			setSelectedProjectIds(
				entries.filter((e) => e.type === "projectId").map((e) => e.value)
			);
			setSelectedLevels(
				entries.filter((e) => e.type === "level").map((e) => e.value)
			);
		}
	}, [open, currentFilters]);

	const allProjectIds = useMemo(
		() => projects.map((p) => p.project_uuid),
		[projects]
	);
	const isAllProjectsSelected =
		projects.length > 0 && selectedProjectIds.length === projects.length;

	const handleToggleProject = useCallback((projectUuid: string) => {
		setSelectedProjectIds((prev) =>
			prev.includes(projectUuid)
				? prev.filter((id) => id !== projectUuid)
				: [...prev, projectUuid]
		);
	}, []);

	const handleToggleAllProjects = useCallback(() => {
		if (isAllProjectsSelected) {
			setSelectedProjectIds([]);
		} else {
			setSelectedProjectIds(allProjectIds);
		}
	}, [isAllProjectsSelected, allProjectIds]);

	const handleToggleLevel = useCallback((level: string) => {
		setSelectedLevels((prev) =>
			prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
		);
	}, []);

	const handleSave = useCallback(() => {
		const entries: FilterEntry[] = [
			...selectedProjectIds.map((id) => ({
				type: "projectId" as const,
				value: id,
			})),
			...selectedLevels.map((level) => ({
				type: "level" as const,
				value: level,
			})),
		];
		onSave(buildFilterString(entries));
		onOpenChange(false);
	}, [selectedProjectIds, selectedLevels, onSave, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("filter.dialogTitle")}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-6 py-2">
					{/* Projects Section */}
					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-semibold">{t("filter.projects")}</h3>
						<div className="flex items-center gap-2 px-1 py-2 border-b">
							<Checkbox
								id="select-all-projects"
								checked={isAllProjectsSelected}
								onCheckedChange={handleToggleAllProjects}
							/>
							<Label
								htmlFor="select-all-projects"
								className="font-medium cursor-pointer text-sm"
							>
								Select All
							</Label>
						</div>
						<div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
							{projects.map((project) => (
								<div
									key={project.project_uuid}
									className="flex items-start gap-2 px-1 py-2 rounded-sm hover:bg-accent transition-colors"
								>
									<Checkbox
										id={`project-${project.project_uuid}`}
										checked={selectedProjectIds.includes(project.project_uuid)}
										onCheckedChange={() =>
											handleToggleProject(project.project_uuid)
										}
										className="mt-1"
									/>
									<Label
										htmlFor={`project-${project.project_uuid}`}
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

					<Separator />

					{/* Levels Section */}
					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-semibold">{t("filter.levels")}</h3>
						<div className="flex flex-col gap-1">
							{LEVELS.map((level) => (
								<div
									key={level}
									className="flex items-center gap-2 px-1 py-2 rounded-sm hover:bg-accent transition-colors"
								>
									<Checkbox
										id={`level-${level}`}
										checked={selectedLevels.includes(level)}
										onCheckedChange={() => handleToggleLevel(level)}
									/>
									<Label
										htmlFor={`level-${level}`}
										className="font-medium cursor-pointer text-sm capitalize"
									>
										{t(`level.${level}`)}
									</Label>
								</div>
							))}
						</div>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{t("filter.cancel")}</Button>
					</DialogClose>
					<Button onClick={handleSave}>{t("filter.save")}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default LoggingFilterDialog;
