import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type DeleteUserParams = {
	projectId: string;
	userId: string;
};

export const deleteUser = async (params: DeleteUserParams): Promise<void> => {
	const { userId } = params;
	await apiClient.delete(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${params.projectId}/users/${userId}`
	);
};
