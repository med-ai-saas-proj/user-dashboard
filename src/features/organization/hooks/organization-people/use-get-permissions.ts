import { useQuery } from "@tanstack/react-query";
import {
	getPermissions,
	type GetPermissionsParams,
} from "../../services/organization-people/get-permissions";

export const useGetPermissions = (params: GetPermissionsParams) => {
	return useQuery({
		queryKey: ["organizationPermissions", params.organizationId, params.userId],
		queryFn: () => getPermissions(params),
		enabled: !!params.organizationId && !!params.userId,
	});
};
