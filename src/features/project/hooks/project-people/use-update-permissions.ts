import { useMutation } from "@tanstack/react-query";
import type { UpdateProjectPermissionsParams } from "../../services/project-people/update-permissions";
import { updateProjectPermissions } from "../../services/project-people/update-permissions";

export const useUpdatePermissions = () => {
	return useMutation({
		mutationKey: ["project-update-permissions"],
		mutationFn: (params: UpdateProjectPermissionsParams) =>
			updateProjectPermissions(params),
	});
};
