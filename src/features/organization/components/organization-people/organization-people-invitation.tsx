import { useGetInvitations } from "../../hooks/organization-people/use-get-invitations";
import OrganizationPeopleInvitationItem from "./organization-people-invitation-item";

const OrganizationPeopleInvitation = () => {
	const fakeOrgId = "123";
	const { data: invitations } = useGetInvitations({
		organizationId: fakeOrgId,
	});

	return (
		<div className="border rounded-md">
			{invitations?.results.map((invitation) => (
				<OrganizationPeopleInvitationItem
					key={invitation.id}
					invitation={invitation}
				/>
			))}
		</div>
	);
};

export default OrganizationPeopleInvitation;
