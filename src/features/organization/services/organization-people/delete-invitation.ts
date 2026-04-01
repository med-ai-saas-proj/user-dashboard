import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";

export type DeleteInvitationParams = {
	organizationId: string;
	invitationId: string;
};

export const deleteInvitation = async ({
	organizationId,
	invitationId,
}: DeleteInvitationParams): Promise<void> => {
	await apiClient.delete(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/invitations/${invitationId}`
	);
};
