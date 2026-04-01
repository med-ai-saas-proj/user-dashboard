import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";

export type UpdateUserPermissionsRequest = {
	organizationId: string;
	userId: string;
	permissions: string[];
};

export const updateUserPermissions = async (
	params: UpdateUserPermissionsRequest
) => {
	const { organizationId, userId, permissions } = params;
	return apiClient.put(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/users/${userId}/permissions`,
		{ permissions }
	);
};
