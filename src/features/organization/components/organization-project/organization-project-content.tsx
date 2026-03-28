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
import { Archive, Settings } from "lucide-react";

const OrganizationProjectContent = () => {
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);
	const { data: projects } = useGetOrganizationProjects({
		organizationId: fakeOrgId,
	});

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
				{projects?.results.map((project) => (
					<TableRow key={project.id}>
						<TableCell>{project.name}</TableCell>
						<TableCell>{project.id}</TableCell>
						<TableCell>{project.description}</TableCell>
						<TableCell>
							<div className="flex items-center gap-x-6 justify-end">
								<Settings size={"16"} />
								<Archive size={"16"} className="text-destructive" />
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default OrganizationProjectContent;
