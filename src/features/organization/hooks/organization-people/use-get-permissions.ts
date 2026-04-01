import { useQuery } from "@tanstack/react-query";
import {
	getUserPermissions,
	type GetUserPermissionsParams,
} from "../../services/organization-people/get-user-permissions";

export const useGetUserPermissions = (params: GetUserPermissionsParams) => {
	return useQuery({
		queryKey: [
			"organization-user-permissions",
			params.organizationId,
			params.userId,
		],
		queryFn: () => getUserPermissions(params),
		enabled: !!params.organizationId && !!params.userId,
	});
};
