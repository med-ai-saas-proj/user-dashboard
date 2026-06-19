import { useQuery } from "@tanstack/react-query";
import type { GetAllProjectRolesParams } from "../../services/project-people/get-all-roles";
import { getAllProjectRoles } from "../../services/project-people/get-all-roles";

export const useGetAllRoles = (params: GetAllProjectRolesParams) => {
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;

	return useQuery({
		queryKey: ["project-get-all-roles", params],
		queryFn: () => getAllProjectRoles(params),
		enabled: !!params.projectId,
	});
};
