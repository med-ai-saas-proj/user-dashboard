import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { OrganizationInvitation } from "../../organization.type";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import { useResendInvitation } from "../../hooks/organization-people/use-resend-invitation";
import { useDeleteInvitation } from "../../hooks/organization-people/use-delete-invitation";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogHeader,
	DialogDescription,
	DialogFooter,
	DialogClose,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { useOrganizationStore } from "../../store/organization";

const OrganizationPeopleInvitationItem = ({
	invitation,
}: {
	invitation: OrganizationInvitation;
}) => {
	const { t } = useTranslation("organization");
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);
	const [isResendInvitation, setIsResendInvitation] = useState<boolean>(false);

	const { mutate: resendInvitation } = useResendInvitation();
	const { mutate: deleteInvitation } = useDeleteInvitation();

	const handleResendInvitation = (invitationId: string) => {
		resendInvitation({
			organizationId: fakeOrgId,
			invitationId,
		});
		setIsResendInvitation(true);
	};
	const handleDeleteInvitation = (invitationId: string) => {
		deleteInvitation({
			organizationId: fakeOrgId,
			invitationId,
		});
	};

	return (
		<div
			key={invitation.id}
			className="flex items-center justify-between p-4 border-b last:border-b-0"
		>
			<div className="flex items-center gap-4">
				<Avatar>
					<AvatarImage src="" />
					<AvatarFallback>{invitation.email[0].toUpperCase()}</AvatarFallback>
				</Avatar>
				<p className="text-sm font-medium">{invitation.email}</p>
			</div>
			<div className="flex items-center gap-4">
				<Button
					variant="secondary"
					size="sm"
					onClick={() => handleResendInvitation(invitation.id)}
					disabled={isResendInvitation}
				>
					{t("people.invitations.item.actions.resend")}
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="secondary" size="sm">
							{t("people.invitations.item.actions.remove")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("people.invitations.item.removeDialog.title")}
							</DialogTitle>
							<DialogDescription>
								{t("people.invitations.item.removeDialog.description", {
									email: invitation.email,
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="secondary" size="sm">
									{t("people.invitations.item.actions.cancel")}
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleDeleteInvitation(invitation.id)}
							>
								{t("people.invitations.item.actions.remove")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default OrganizationPeopleInvitationItem;
