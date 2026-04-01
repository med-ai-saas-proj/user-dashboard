import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationPermissions } from "../../organization.type";

export type GetUserPermissionsParams = {
	organizationId: string;
	userId: string;
};

export const getUserPermissions = async (
	params: GetUserPermissionsParams
): Promise<OrganizationPermissions> => {
	const { organizationId, userId } = params;
	const response = await apiClient.get(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(
			":organizationId",
			organizationId
		)}/users/${userId}/permissions`
	);

	return response.data;
};
