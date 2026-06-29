import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { Invitation } from "../../types/invitation";

export type ResendInvitationParams = {
	organizationId: string;
	invitationId: string;
};

export const resendInvitation = async ({
	organizationId,
	invitationId,
}: ResendInvitationParams): Promise<Invitation> => {
	const response = await apiClient.post<Invitation>(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/invitations/${invitationId}/resend`
	);
	return response.data;
};
