import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetUsers } from "../../hooks/organization-people/use-get-users";
import OrganizationPeopleMemberItem from "./organization-people-member-item";
import type { OrganizationUser } from "../../organization.type";
import OrganizationPeopleMemberDetails from "./organization-people-member-details";
import OrganizationPeopleLayout from "./organization-people-layout";
import { Spinner } from "@/components/shadcn/spinner";
import InvitationDialog from "./dialogs/invitation-dialog";

const OrganizationPeopleMember = () => {
	const { t } = useTranslation("organization");
	const fakeOrgId = "123";
	const { data: users, isPending } = useGetUsers({
		organizationId: fakeOrgId,
	});

	const [openAddMemeberDialog, setOpenAddMemberDialog] =
		useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(
		null
	);

	const handleSelectUser = (user: OrganizationUser) => {
		if (!user) return;
		setSelectedUser(user);
	};

	return (
		<>
			<OrganizationPeopleLayout onAdd={() => setOpenAddMemberDialog(true)} />
			<InvitationDialog
				open={openAddMemeberDialog}
				onOpenChange={setOpenAddMemberDialog}
			/>
			<div className="flex gap-8">
				<div className="flex-7 flex-col border rounded-md">
					{isPending && (
						<div className="flex items-center justify-center h-full">
							<div className="flex items-center justify-center gap-2">
								<Spinner />
								<p className="text-center text-sm text-muted-foreground">
									{t("people.members.loading")}
								</p>
							</div>
						</div>
					)}
					{!isPending &&
						users?.results.map((user) => (
							<OrganizationPeopleMemberItem
								key={user.id}
								id={user.id}
								username={user.username}
								email={user.email}
								onClick={() => handleSelectUser(user)}
							/>
						))}
				</div>
				<div className="flex-3 border-l p-8">
					{!selectedUser && (
						<div className="flex items-center justify-center h-full">
							<p className="text-center text-muted-foreground">
								{t("people.members.emptySelection")}
							</p>
						</div>
					)}
					{selectedUser && (
						<OrganizationPeopleMemberDetails user={selectedUser} />
					)}
				</div>
			</div>
		</>
	);
};

export default OrganizationPeopleMember;
