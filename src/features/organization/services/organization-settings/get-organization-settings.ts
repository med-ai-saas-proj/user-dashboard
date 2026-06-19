import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationSettings } from "../../organization.type";

export const getOrganizationSettings = async (organizationId: string) => {
	const response = await apiClient.get<OrganizationSettings>(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/settings`
	);

	return response.data;
};
