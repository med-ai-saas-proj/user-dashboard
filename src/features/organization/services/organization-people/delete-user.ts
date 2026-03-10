import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type DeleteUserParams = {
	organizationId: string;
	userId: string;
};

export const deleteUser = async (params: DeleteUserParams): Promise<void> => {
	const { userId } = params;

	try {
		await apiClient.delete(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(":organizationId", params.organizationId)}/${userId}`
		);
	} catch (error) {
		console.error("Error deleting user from organization:", error);
		throw error;
	}
};
