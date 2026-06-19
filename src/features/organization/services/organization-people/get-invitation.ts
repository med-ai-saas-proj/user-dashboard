import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationInvitationResponse } from "../../organization.type";

export type GetInvitationsParams = {
	organizationId: string;
};

export const getInvitations = async ({
	organizationId,
}: GetInvitationsParams): Promise<OrganizationInvitationResponse> => {
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/invitations`
	);
	return response.data;
};
