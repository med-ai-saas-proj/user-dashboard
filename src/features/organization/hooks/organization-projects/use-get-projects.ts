import { useQuery } from "@tanstack/react-query";
import { getOrganizationProjects } from "../../services/organization-projects/get-projects";
import type { OrganizationProjectsParams } from "../../services/organization-projects/get-projects";
import type { OrganizationProjectsResponse } from "../../organization.type";

export const useGetOrganizationProjects = (
	params: OrganizationProjectsParams
) => {
	return useQuery<OrganizationProjectsResponse, Error>({
		queryKey: ["organizationProjects", params.organizationId],
		queryFn: () => getOrganizationProjects(params),
	});
};
