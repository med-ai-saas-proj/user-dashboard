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
	try {
		await apiClient.delete(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(":organizationId", organizationId)}/invitations/${invitationId}`
		);
	} catch (error) {
		console.error("Error deleting organization invitation:", error);
		throw error;
	}
};
