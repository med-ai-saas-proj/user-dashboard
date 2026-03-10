import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { OrganizationUserResponse } from "../../organization.type";

import { userList } from "./organization-people.config";

export type GetUsersParams = {
	organizationId: string;
	limit?: number;
	offset?: number;
	q?: string;
};

export const getUsers = async (
	params: GetUsersParams
): Promise<OrganizationUserResponse> => {
	const { organizationId, limit, offset, q } = params;

	try {
		const response = await apiClient.get(
			`${API_ROUTES.MANAGEMENT.ORGANIZATION.PEOPLE.replace(
				":organizationId",
				organizationId
			)}/users`,
			{
				params: {
					limit,
					offset,
					q,
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error("Error fetching organization users:", error);
		return userList;
	}
};
