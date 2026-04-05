import { useQuery } from "@tanstack/react-query";
import { getOrganizationProjects } from "../../services/organization-projects/get-projects";
import type { OrganizationProjectsParams } from "../../services/organization-projects/get-projects";
import type { OrganizationProjectsResponse } from "../../organization.type";

export const useGetOrganizationProjects = (
	params: OrganizationProjectsParams
) => {
	if (!params.offset) params.offset = 0;
	if (!params.limit) params.limit = 10;

	return useQuery<OrganizationProjectsResponse, Error>({
		queryKey: [
			"organizationProjects",
			params.organizationId,
			params.offset,
			params.limit,
		],
		queryFn: () => getOrganizationProjects(params),
	});
};
