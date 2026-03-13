import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useGetInvitations } from "../../hooks/organization-people/use-get-invitations";
import OrganizationPeopleInvitationItem from "./organization-people-invitation-item";
import OrganizationPeopleLayout from "./organization-people-layout";
import InvitationDialog from "./dialogs/invitation-dialog";

const OrganizationPeopleInvitation = () => {
	const { t } = useTranslation("organization");
	const fakeOrgId = "123";
	const [openInviteDialog, setOpenInviteDialog] = useState<boolean>(false);

	const { data: invitations, isPending } = useGetInvitations({
		organizationId: fakeOrgId,
	});

	return (
		<>
			<OrganizationPeopleLayout
				addedButtonText={t("people.layout.inviteMember")}
				onAdd={() => setOpenInviteDialog(true)}
			/>
			<InvitationDialog
				open={openInviteDialog}
				onOpenChange={setOpenInviteDialog}
			/>
			<div
				className={cn("border rounded-md", {
					"p-4": isPending,
				})}
			>
				{isPending && (
					<div className="flex items-center justify-center h-full">
						<div className="flex items-center justify-center gap-2">
							<Spinner />
							<p className="text-center text-sm text-muted-foreground">
								{t("people.invitations.loading")}
							</p>
						</div>
					</div>
				)}
				{!isPending &&
					invitations?.results.map((invitation) => (
						<OrganizationPeopleInvitationItem
							key={invitation.id}
							invitation={invitation}
						/>
					))}
			</div>
		</>
	);
};

export default OrganizationPeopleInvitation;
