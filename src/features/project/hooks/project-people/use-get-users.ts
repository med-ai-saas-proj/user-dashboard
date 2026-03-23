import { useQuery } from "@tanstack/react-query";
import {
	getProjectUsers,
	type GetProjectUsersParams,
} from "../../services/project-people/get-users";

export const useGetUsers = (params: GetProjectUsersParams) => {
	if (!params.limit) params.limit = 10;
	if (!params.offset) params.offset = 0;

	return useQuery({
		queryKey: ["project-users", params],
		queryFn: () => getProjectUsers(params),
		enabled: !!params.projectId,
	});
};
