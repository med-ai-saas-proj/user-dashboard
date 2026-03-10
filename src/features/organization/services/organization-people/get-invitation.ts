import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationInvitationResponse } from "../../organization.type";

import { invitationList } from "./organization-people.config";

export type GetInvitationsParams = {
	organizationId: string;
};

export const getInvitations = async ({
	organizationId,
}: GetInvitationsParams): Promise<OrganizationInvitationResponse> => {
	try {
		const response = await apiClient.get(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(":organizationId", organizationId)}/invitations`
		);
		return response.data;
	} catch (error) {
		console.error("Error fetching organization invitations:", error);
		return invitationList; // Return mock data in case of an error
	}
};
