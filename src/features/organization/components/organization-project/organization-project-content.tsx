import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { useGetOrganizationProjects } from "../../hooks/organization-projects/use-get-projects";
import { Settings } from "lucide-react";
import OrganizationProjectArchiveDialog from "./organization-project-archive-dialog";
import OrganizationProjectUnarchiveDialog from "./organization-project-unarchive-dialog";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "@/features/project/store/project";
import { useAuthStore } from "@/features/auth/store/auth-store";

type OrganizationProjectContentProps = {
	isArchived: boolean;
};

const OrganizationProjectContent = ({
	isArchived,
}: OrganizationProjectContentProps) => {
	const { t } = useTranslation("organization");
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const setProjectId = useProjectStore((state) => state.setProjectId);
	const navigate = useNavigate();

	const baseLimit = 10;
	const [page, setPage] = useState(1);

	const { data: projectsResponse, isPending } = useGetOrganizationProjects({
		organizationId,
		offset: 0,
		limit: page * baseLimit,
	});

	const canLoadMore =
		projectsResponse !== undefined &&
		projectsResponse.results.length < projectsResponse.total;

	const filteredProjects = useMemo(() => {
		if (!projectsResponse) return [];

		return projectsResponse.results.filter(
			(project) => project.archived === isArchived
		);
	}, [projectsResponse, isArchived]);

	const handleLoadMore = () => {
		if (canLoadMore) {
			setPage((prevPage) => prevPage + 1);
		}
	};

	const handleNavigateToProject = (projectId: string) => {
		setProjectId(projectId);
		navigate(`/project/${projectId}/general`);
	};

	if (!isPending && filteredProjects.length === 0) {
		return (
			<div className="flex flex-col items-center gap-y-4">
				<p className="text-muted-foreground">
					{t("project.content.noProjects")}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-y-4">
			<Table className="table-fixed w-full">
				<TableHeader>
					<TableRow>
						<TableHead className="w-10">#</TableHead>

						<TableHead className="w-xs truncate">
							{t("project.content.tableHeaders.name")}
						</TableHead>

						<TableHead className="w-xs truncate">
							{t("project.content.tableHeaders.id")}
						</TableHead>

						<TableHead>
							{t("project.content.tableHeaders.description")}
						</TableHead>

						<TableHead className="w-20"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredProjects.map((project, index) => (
						<TableRow key={project.id}>
							<TableCell>
								<p className="text-muted-foreground">{index + 1}</p>
							</TableCell>
							<TableCell>{project.name}</TableCell>
							<TableCell>{project.id}</TableCell>
							<TableCell>{project.description}</TableCell>
							<TableCell>
								<div className="flex items-center gap-x-6 justify-end">
									<Settings
										size={"16"}
										onClick={() => handleNavigateToProject(project.id)}
									/>
									{!project.archived && (
										<OrganizationProjectArchiveDialog
											projectId={project.id}
											projectName={project.name}
										/>
									)}
									{project.archived && (
										<OrganizationProjectUnarchiveDialog
											projectId={project.id}
											projectName={project.name}
										/>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{isPending && (
				<div className="flex items-center justify-center h-full">
					<div className="flex items-center justify-center gap-2">
						<Spinner />
						<p className="text-muted-foreground">
							{t("project.content.loading")}
						</p>
					</div>
				</div>
			)}
			{canLoadMore && !isPending && (
				<Button variant={"secondary"} onClick={handleLoadMore}>
					{t("project.content.actions.loadMore")}
				</Button>
			)}
			{!canLoadMore && !isPending && (
				<p className="text-sm text-muted-foreground">
					{t("project.content.endOfList")}
				</p>
			)}
		</div>
	);
};

export default OrganizationProjectContent;
