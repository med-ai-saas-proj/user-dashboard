import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationPermissions } from "../../organization.type";

export type UpdatePermissionsRequest = {
	organizationId: string;
	userId: string;
	permissions: OrganizationPermissions;
};

export const updatePermissions = async (params: UpdatePermissionsRequest) => {
	const { organizationId, userId, permissions } = params;
	return apiClient.put(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(
			":organizationId",
			organizationId
		)}/users/${userId}/permissions`,
		{ permissions }
	);
};
