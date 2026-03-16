import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationPermissions } from "../../organization.type";

export type GetPermissionsParams = {
	organizationId: string;
	userId: string;
};

export const getPermissions = async (
	params: GetPermissionsParams
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
