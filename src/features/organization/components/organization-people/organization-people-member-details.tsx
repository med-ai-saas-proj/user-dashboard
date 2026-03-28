import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@/components/shadcn/avatar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import type { OrganizationUser } from "../../organization.type";
import { useTranslation } from "react-i18next";

type OrganizationPeopleMemberDetailsProps = {
	user: OrganizationUser;
	isDialog?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

const OrganizationPeopleMemberDetails = ({
	user,
	isDialog = false,
	open,
	onOpenChange,
}: OrganizationPeopleMemberDetailsProps) => {
	const { t } = useTranslation("organization");

	const content = (
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

	if (isDialog) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("people.members.details.title")}</DialogTitle>
					</DialogHeader>
					{content}
				</DialogContent>
			</Dialog>
		);
	}

	return content;
};

export default OrganizationPeopleMemberDetails;
