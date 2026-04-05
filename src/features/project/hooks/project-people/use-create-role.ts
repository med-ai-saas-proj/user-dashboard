import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createProjectRole,
	type CreateProjectRoleCredentials,
} from "../../services/project-people/create-role";

export const useCreateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-create-role"],
		mutationFn: (credentials: CreateProjectRoleCredentials) =>
			createProjectRole(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-get-all-roles"],
				exact: false,
			});
		},
	});
};
