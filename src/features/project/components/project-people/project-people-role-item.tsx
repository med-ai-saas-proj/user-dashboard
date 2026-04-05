import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import type { ProjectRole } from "../../project.type";
import { Button } from "@/components/shadcn/button";
import ProjectPeopleRoleItemDropdown from "./project-people-role-item-dropdown";
import { useTranslation } from "react-i18next";

type ProjectPeopleRoleItemProps = React.HTMLAttributes<HTMLDivElement> & {
	projectRole: ProjectRole;
};

const ProjectPeopleRoleItem: React.FC<ProjectPeopleRoleItemProps> = ({
	projectRole,
	...props
}) => {
	const { t } = useTranslation("project");

	return (
		<div
			className="p-4 border-b last:border-b-0 flex items-center justify-between"
			{...props}
		>
			<div className="flex items-center gap-4 hover:cursor-pointer">
				<Avatar>
					<AvatarFallback>
						{projectRole.roleName[0].toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div>
					<p className="font-medium">{projectRole.roleName}</p>
					<p className="text-sm text-muted-foreground">
						{projectRole.description}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-x-4">
				<Button variant="secondary" size="sm">
					{t("people.role.actions.assignments")}
				</Button>
				<Button variant="default" size="sm">
					{t("people.role.actions.permissions")}
				</Button>
				<ProjectPeopleRoleItemDropdown
					roleId={projectRole.id}
					roleName={projectRole.roleName}
					roleDescription={projectRole.description}
				/>
			</div>
		</div>
	);
};

export default ProjectPeopleRoleItem;
