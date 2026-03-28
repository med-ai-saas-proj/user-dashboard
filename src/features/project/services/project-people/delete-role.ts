import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type DeleteProjectRoleCredentials = {
	projectId: string;
	roleId: string;
};

export const deleteProjectRole = async (
	credentials: DeleteProjectRoleCredentials
): Promise<void> => {
	const { projectId, roleId } = credentials;

	await apiClient.delete(
		`${API_ROUTES.MANAGEMENT.PROJECT}/${projectId}/roles/${roleId}`
	);
};
