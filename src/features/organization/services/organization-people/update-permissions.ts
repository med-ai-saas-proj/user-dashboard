import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationPermissions } from "../../organization.type";

export type UpdatePermissionsParams = {
	organizationId: string;
	userId: string;
	permissions: OrganizationPermissions;
};

export const updatePermissions = async (params: UpdatePermissionsParams) => {
	const { organizationId, userId, permissions } = params;
	return apiClient.put(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(
			"{organizationId}",
			organizationId
		)}/${userId}/permissions`,
		{ permissions }
	);
};
