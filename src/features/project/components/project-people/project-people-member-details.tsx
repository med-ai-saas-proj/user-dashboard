import type { ProjectUser } from "../../project.type";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@/components/shadcn/avatar";

type ProjectPeopleMemberDetailsProps = {
	user: ProjectUser;
};

const ProjectPeopleMemberDetails = ({
	user,
}: ProjectPeopleMemberDetailsProps) => {
	return (
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
	);
};

export default ProjectPeopleMemberDetails;
