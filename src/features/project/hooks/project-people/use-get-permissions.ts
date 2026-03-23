import { useQuery } from "@tanstack/react-query";
import type { GetProjectPermissionsParams } from "../../services/project-people/get-permissions";
import { getProjectPermissions } from "../../services/project-people/get-permissions";

export const useGetPermissions = (params: GetProjectPermissionsParams) => {
	return useQuery({
		queryKey: ["project-permissions", params],
		queryFn: () => getProjectPermissions(params),
		enabled: !!params.projectId,
	});
};
