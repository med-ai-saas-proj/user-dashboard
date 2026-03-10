import { useMutation } from "@tanstack/react-query";
import {
	updatePermissions,
	type UpdatePermissionsParams,
} from "../../services/organization-people/update-permissions";

export const useUpdatePermissions = (params: UpdatePermissionsParams) => {
	return useMutation({
		mutationKey: ["updatePermissions", params],
		mutationFn: () => updatePermissions(params),
	});
};
