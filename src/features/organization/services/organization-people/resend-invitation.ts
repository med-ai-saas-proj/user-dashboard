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
	try {
		await apiClient.post(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(":organizationId", organizationId)}/invitations/${invitationId}/resend`
		);
	} catch (error) {
		console.error("Error resending invitation:", error);
		throw error;
	}
};
