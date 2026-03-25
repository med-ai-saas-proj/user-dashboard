import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateProjectRole,
	type UpdateProjectRoleCredentials,
} from "../../services/project-people/update-role";

export const useUpdateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-update-role"],
		mutationFn: (credentials: UpdateProjectRoleCredentials) =>
			updateProjectRole(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-roles"],
				exact: false,
			});
		},
	});
};
