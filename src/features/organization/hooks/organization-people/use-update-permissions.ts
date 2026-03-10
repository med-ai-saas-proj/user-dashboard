import { useMutation } from "@tanstack/react-query";
import {
	updatePermissions,
	type UpdatePermissionsRequest,
} from "../../services/organization-people/update-permissions";

export const useUpdatePermissions = () => {
	return useMutation({
		mutationKey: ["updatePermissions"],
		mutationFn: (params: UpdatePermissionsRequest) => updatePermissions(params),
	});
};
