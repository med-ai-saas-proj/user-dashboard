import { useMutation } from "@tanstack/react-query";
import type { UpdateProjectPermissionsParams } from "../../services/project-people/update-user-permissions";
import { updateProjectUserPermissions } from "../../services/project-people/update-user-permissions";

export const useUpdateProjectUserPermissions = () => {
	return useMutation({
		mutationKey: ["project-update-permissions"],
		mutationFn: (params: UpdateProjectPermissionsParams) =>
			updateProjectUserPermissions(params),
	});
};
