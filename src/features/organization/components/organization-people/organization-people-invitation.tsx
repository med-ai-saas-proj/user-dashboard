import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useGetInvitations } from "../../hooks/organization-people/use-get-invitations";
import OrganizationPeopleInvitationItem from "./organization-people-invitation-item";
import InvitationDialog from "./dialogs/invitation-dialog";
import { Button } from "@/components/shadcn/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Plus, Search } from "lucide-react";

const OrganizationPeopleInvitation = () => {
	const { t } = useTranslation("organization");
	const fakeOrgId = "123";
	const [openInviteDialog, setOpenInviteDialog] = useState<boolean>(false);

	const { data: invitations, isPending } = useGetInvitations({
		organizationId: fakeOrgId,
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
				<Button variant="default" onClick={() => setOpenInviteDialog(true)}>
					<Plus />
					{t("people.layout.inviteMember")}
				</Button>
			</div>
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
