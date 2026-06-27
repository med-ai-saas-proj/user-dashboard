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
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useGetUserPermissions } from "../../hooks/organization-people/use-get-user-permissions";
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
	const organizationId = useAuthStore((state) => state.organization?.id) || "";

	const { data: userPermissions } = useGetUserPermissions({
		organizationId,
		userId: user.id,
	});

	const content = (
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
