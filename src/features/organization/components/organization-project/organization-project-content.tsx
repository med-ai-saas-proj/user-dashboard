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
import { useMemo } from "react";

type OrganizationProjectContentProps = {
	isArchived: boolean;
};

const OrganizationProjectContent = ({
	isArchived,
}: OrganizationProjectContentProps) => {
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);
	const { data: projects } = useGetOrganizationProjects({
		organizationId: fakeOrgId,
	});

	const filteredProjects = useMemo(() => {
		if (!projects) return [];

		return projects.results.filter(
			(project) => project.archived === isArchived
		);
	}, [projects, isArchived]);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>NAME</TableHead>
					<TableHead>ID</TableHead>
					<TableHead>DESCRIPTION</TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{filteredProjects.map((project) => (
					<TableRow key={project.id}>
						<TableCell>{project.name}</TableCell>
						<TableCell>{project.id}</TableCell>
						<TableCell>{project.description}</TableCell>
						<TableCell>
							<div className="flex items-center gap-x-6 justify-end">
								<Settings size={"16"} />
								<OrganizationProjectArchiveDialog
									projectId={project.id}
									projectName={project.name}
								/>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default OrganizationProjectContent;
