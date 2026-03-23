import { useMutation } from "@tanstack/react-query";
import type { UpdateProjectRolesParams } from "../../services/project-people/update-roles";
import { updateProjectRoles } from "../../services/project-people/update-roles";

export const useUpdateRoles = () => {
	return useMutation({
		mutationKey: ["project-update-roles"],
		mutationFn: (params: UpdateProjectRolesParams) =>
			updateProjectRoles(params),
	});
};
