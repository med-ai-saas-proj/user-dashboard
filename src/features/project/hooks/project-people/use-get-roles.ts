import { useQuery } from "@tanstack/react-query";
import type { GetProjectRolesParams } from "../../services/project-people/get-roles";
import { getProjectRoles } from "../../services/project-people/get-roles";

export const useGetRoles = (params: GetProjectRolesParams) => {
	return useQuery({
		queryKey: ["project-roles", params],
		queryFn: () => getProjectRoles(params),
		enabled: !!params.projectId,
	});
};
