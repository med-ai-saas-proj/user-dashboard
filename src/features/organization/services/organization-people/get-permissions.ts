import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationPermissions } from "../../organization.type";

export const getOrganizationPermissions = async () => {
	const response = await apiClient.get<OrganizationPermissions>(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/permissions`
	);
	return response.data;
};
