import { useState } from "react";
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

const OrganizationPeopleInvitationItem = ({
	invitation,
}: {
	invitation: OrganizationInvitation;
}) => {
	const fakeOrgId = "123";
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
					Resend
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="secondary" size="sm">
							Remove
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Removal Confirm</DialogTitle>
							<DialogDescription>
								Are you sure you want to remove the invitation for{" "}
								<strong>{invitation.email}</strong>?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="secondary" size="sm">
									Cancel
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleDeleteInvitation(invitation.id)}
							>
								Remove
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default OrganizationPeopleInvitationItem;
