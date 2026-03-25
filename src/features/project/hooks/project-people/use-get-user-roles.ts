import { useQuery } from "@tanstack/react-query";
import type { GetProjectRolesParams } from "../../services/project-people/get-user-roles";
import { getUserProjectRoles } from "../../services/project-people/get-user-roles";

export const useGetRoles = (params: GetProjectRolesParams) => {
	return useQuery({
		queryKey: ["project-user-roles", params],
		queryFn: () => getUserProjectRoles(params),
		enabled: !!params.projectId,
	});
};
