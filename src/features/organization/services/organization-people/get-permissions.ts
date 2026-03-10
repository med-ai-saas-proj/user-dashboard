import apiClient from "@/query/api-client";
import { API_ROUTES } from "@/config/api-routes";
import type { OrganizationPermissions } from "../../organization.type";

import { userPermissions } from "../../services/organization-people/organization-people.config";

export type GetPermissionsParams = {
	organizationId: string;
	userId: string;
};

export const getPermissions = async (
	params: GetPermissionsParams
): Promise<OrganizationPermissions> => {
	const { organizationId, userId } = params;

	try {
		const response = await apiClient.get(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(
				":organizationId",
				organizationId
			)}/${userId}/permissions`
		);

		return response.data;
	} catch (error) {
		console.error("Error fetching permissions:", error);
		return userPermissions; // Return mock permissions on error
	}
};
