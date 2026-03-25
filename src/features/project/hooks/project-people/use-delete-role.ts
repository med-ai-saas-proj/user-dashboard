import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteProjectRole,
	type DeleteProjectRoleCredentials,
} from "../../services/project-people/delete-role";

export const useDeleteRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-delete-role"],
		mutationFn: (credentials: DeleteProjectRoleCredentials) =>
			deleteProjectRole(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-roles"],
				exact: false,
			});
		},
	});
};
