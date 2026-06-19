import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationSettings } from "../../organization.type";

export const updateOrganizationSettings = async (
	organizationId: string,
	data: OrganizationSettings
) => {
	const response = await apiClient.patch(
		`${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/settings`,
		data
	);
	return response.data;
};
