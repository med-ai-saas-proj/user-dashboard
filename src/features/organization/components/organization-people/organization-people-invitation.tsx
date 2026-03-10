import { Spinner } from "@/components/shadcn/spinner";
import { useGetInvitations } from "../../hooks/organization-people/use-get-invitations";
import OrganizationPeopleInvitationItem from "./organization-people-invitation-item";
import { cn } from "@/lib/utils";

const OrganizationPeopleInvitation = () => {
	const fakeOrgId = "123";
	const { data: invitations, isPending } = useGetInvitations({
		organizationId: fakeOrgId,
	});

	return (
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
							Loading invitations...
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
	);
};

export default OrganizationPeopleInvitation;
