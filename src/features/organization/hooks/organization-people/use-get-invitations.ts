import { useQuery } from "@tanstack/react-query";
import { getInvitations } from "../../services/organization-people/get-invitation";
import type { GetInvitationsParams } from "../../services/organization-people/get-invitation";

export const useGetInvitations = (params: GetInvitationsParams) => {
	return useQuery({
		queryKey: ["organization-invitations"],
		queryFn: () => getInvitations(params),
	});
};
