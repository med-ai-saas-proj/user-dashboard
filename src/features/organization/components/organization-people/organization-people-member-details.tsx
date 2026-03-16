import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@/components/shadcn/avatar";
import type { OrganizationUser } from "../../organization.type";

type OrganizationPeopleMemberDetailsProps = {
	user: OrganizationUser;
};

const OrganizationPeopleMemberDetails = ({
	user,
}: OrganizationPeopleMemberDetailsProps) => {
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

export default OrganizationPeopleMemberDetails;
