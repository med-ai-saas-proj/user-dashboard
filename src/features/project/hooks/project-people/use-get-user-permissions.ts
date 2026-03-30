import { useQuery } from "@tanstack/react-query";
import type { GetProjectPermissionsParams } from "../../services/project-people/get-user-permissions";
import { getUserProjectPermissions } from "../../services/project-people/get-user-permissions";

export const useGetUserProjectPermissions = (
	params: GetProjectPermissionsParams
) => {
	return useQuery({
		queryKey: ["project-user-permissions", params],
		queryFn: () => getUserProjectPermissions(params),
		enabled: !!params.projectId,
	});
};
