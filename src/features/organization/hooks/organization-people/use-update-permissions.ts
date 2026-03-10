import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updatePermissions,
	type UpdatePermissionsRequest,
} from "../../services/organization-people/update-permissions";

export const useUpdatePermissions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["updatePermissions"],
		mutationFn: (params: UpdatePermissionsRequest) => updatePermissions(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-permissions"],
				exact: false,
			});
		},
	});
};
