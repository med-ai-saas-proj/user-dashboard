import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import { useGetOrganizationProjects } from "../../hooks/organization-projects/use-get-projects";
import { useOrganizationStore } from "../../store/organization";
import { Settings } from "lucide-react";
import OrganizationProjectArchiveDialog from "./organization-project-archive-dialog";
import { useEffect, useMemo, useState } from "react";
import OrganizationProjectUnarchiveDialog from "./organization-project-unarchive-dialog";
import { Button } from "@/components/shadcn/button";
import type { OrganizationProjectsResponse } from "../../organization.type";
import { Spinner } from "@/components/shadcn/spinner";

type OrganizationProjectContentProps = {
	isArchived: boolean;
};

const OrganizationProjectContent = ({
	isArchived,
}: OrganizationProjectContentProps) => {
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);

	const limit = 10;
	const [page, setPage] = useState(1);

	const [projects, setProjects] = useState<OrganizationProjectsResponse | null>(
		null
	);
	const [canLoadMore, setCanLoadMore] = useState(true);
	const { data: projectsResponse, isPending } = useGetOrganizationProjects({
		organizationId: fakeOrgId,
		offset: (page - 1) * limit,
		limit,
	});

	const filteredProjects = useMemo(() => {
		if (!projects) return [];

		return projects.results.filter(
			(project) => project.archived === isArchived
		);
	}, [projects, isArchived]);

	const handleLoadMore = () => {
		if (
			projectsResponse &&
			projectsResponse.results.length === limit &&
			filteredProjects.length < projectsResponse.total
		) {
			setPage((prevPage) => prevPage + 1);
		} else {
			setCanLoadMore(false);
		}
	};

	useEffect(() => {
		if (projectsResponse) {
			if (page === 1) {
				setProjects(projectsResponse);
			} else {
				setProjects((prevProjects) => {
					if (!prevProjects) return projectsResponse;

					return {
						total: projectsResponse.total,
						results: [...prevProjects.results, ...projectsResponse.results],
					};
				});
			}
		}
	}, [projectsResponse, page]);

	return (
		<div className="flex flex-col items-center gap-y-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>#</TableHead>
						<TableHead>NAME</TableHead>
						<TableHead>ID</TableHead>
						<TableHead>DESCRIPTION</TableHead>
						<TableHead></TableHead>
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
									<Settings size={"16"} />
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
						<p className="text-muted-foreground">Loading projects...</p>
					</div>
				</div>
			)}
			{canLoadMore && !isPending && (
				<Button variant={"secondary"} onClick={handleLoadMore}>
					Load More
				</Button>
			)}
			{!canLoadMore && !isPending && (
				<p className="text-sm text-muted-foreground">
					You have reached the end of the list. No more projects to load.
				</p>
			)}
		</div>
	);
};

export default OrganizationProjectContent;
