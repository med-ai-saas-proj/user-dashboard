import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";

export type SendInvitationData = {
	organizationId: string;
	email: string;
};

export const sendInvitation = async (
	credentials: SendInvitationData
): Promise<void> => {
	const { organizationId } = credentials;
	await apiClient.post(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/invitations`,
		{ email: credentials.email }
	);
};
