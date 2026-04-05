import { useQuery } from "@tanstack/react-query";
import type { GetProjectPermissionsParams } from "../../services/project-people/get-user-permissions";
import { getProjectUserPermissions } from "../../services/project-people/get-user-permissions";

export const useGetProjectUserPermissions = (
	params: GetProjectPermissionsParams
) => {
	return useQuery({
		queryKey: ["project-user-permissions", params],
		queryFn: () => getProjectUserPermissions(params),
		enabled: !!params.projectId,
	});
};
