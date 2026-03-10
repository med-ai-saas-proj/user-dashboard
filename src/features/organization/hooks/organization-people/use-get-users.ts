import { useQuery } from "@tanstack/react-query";
import {
	getUsers,
	type GetUsersParams,
} from "../../services/organization-people/get-users";

export const useGetUsers = (params: GetUsersParams) => {
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;

	return useQuery({
		queryKey: ["organization-users", params],
		queryFn: () => getUsers(params),
		enabled: !!params.organizationId,
	});
};
