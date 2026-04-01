import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";

export type ResendInvitationParams = {
	organizationId: string;
	invitationId: string;
};

export const resendInvitation = async ({
	organizationId,
	invitationId,
}: ResendInvitationParams): Promise<void> => {
	await apiClient.post(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/invitations/${invitationId}/resend`
	);
};
