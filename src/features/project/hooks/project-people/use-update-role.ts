import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateProjectRole,
	type UpdateProjectRoleCredentials,
} from "../../services/project-people/update-role";
import type { ProjectRole } from "../../project.type";

export const useUpdateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-update-role"],
		mutationFn: (credentials: UpdateProjectRoleCredentials) =>
			updateProjectRole(credentials),
		onSuccess: (updatedRole) => {
			queryClient.setQueriesData<ProjectRole[]>(
				{
					queryKey: ["project-get-all-roles"],
					exact: false,
				},
				(oldRoles) => {
					if (!oldRoles) return oldRoles;

					return oldRoles.map((role) =>
						role.id === updatedRole.id ? updatedRole : role
					);
				}
			);
		},
	});
};
