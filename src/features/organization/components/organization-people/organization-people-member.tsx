import { useState } from "react";
import { useGetUsers } from "../../hooks/organization-people/use-get-users";
import OrganizationPeopleMemberItem from "./organization-people-member-item";
import type { OrganizationUser } from "../../organization.type";
import OrganizationPeopleMemberDetails from "./organization-people-member-details";

const OrganizationPeopleMember = () => {
	const fakeOrgId = "123";
	const { data: users } = useGetUsers({ organizationId: fakeOrgId });

	const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(
		null
	);

	const handleSelectUser = (user: OrganizationUser) => {
		if (!user) return;
		setSelectedUser(user);
	};

	return (
		<div className="flex gap-8">
			<div className="flex-7 flex-col border rounded-md">
				{users?.results.map((user) => (
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
				{selectedUser && (
					<OrganizationPeopleMemberDetails user={selectedUser} />
				)}
			</div>
		</div>
	);
};

export default OrganizationPeopleMember;
