import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Spinner } from "@/components/shadcn/spinner";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetAllRoles } from "../../hooks/project-people/use-get-all-roles";
import { useProjectStore } from "../../store/project";
import ProjectPeopleRoleItem from "./project-people-role-item";
import CreateRoleDialog from "./dialog/create-role-dialog";

const ProjectPeopleRole = () => {
	const fakeProjectId = useProjectStore((state) => state.projectId);
	const { t } = useTranslation("project");

	const { data: roles, isPending } = useGetAllRoles({
		projectId: fakeProjectId,
	});

	return (
		<>
			<div className="flex items-center justify-between mb-4 mt-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder={t("people.layout.searchPlaceholder")} />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<CreateRoleDialog />
			</div>
			<div className="flex flex-col border rounded-md">
				{isPending && (
					<div className="flex items-center justify-center h-full">
						<div className="flex items-center justify-center gap-2">
							<Spinner />
							<p className="text-center text-sm text-muted-foreground">
								{t("people.members.loading")}
							</p>
						</div>
					</div>
				)}
				{!isPending &&
					roles?.map((role) => (
						<ProjectPeopleRoleItem key={role.id} projectRole={role} />
					))}
			</div>
		</>
	);
};

export default ProjectPeopleRole;
