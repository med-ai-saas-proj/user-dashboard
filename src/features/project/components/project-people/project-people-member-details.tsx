import { useTranslation } from "react-i18next";
import type { ProjectUser } from "../../project.type";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@/components/shadcn/avatar";
import { useGetProjectUserPermissions } from "../../hooks/project-people/use-get-project-user-permissions";
import { useParams } from "react-router-dom";

type ProjectPeopleMemberDetailsProps = {
	user: ProjectUser;
};

const ProjectPeopleMemberDetails = ({
	user,
}: ProjectPeopleMemberDetailsProps) => {
	const { t } = useTranslation("project");
	const params = useParams();

	const { data: userPermissions } = useGetProjectUserPermissions({
		projectId: params.projectId || "",
		userId: user.id,
	});

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<Avatar>
					<AvatarImage src="" />
					<AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="flex flex-col">
					<p className="font-semibold">{user.username}</p>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>
			</div>
			{userPermissions && userPermissions.permissions.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium text-muted-foreground">
						{t("people.members.details.permissions")}
					</p>
					<div className="flex flex-wrap gap-2">
						{userPermissions.permissions.map((permission) => (
							<span
								key={permission}
								className="inline-flex items-center rounded-sm bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
							>
								{permission}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default ProjectPeopleMemberDetails;
