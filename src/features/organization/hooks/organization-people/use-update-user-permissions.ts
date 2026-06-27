import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateUserPermissions,
	type UpdateUserPermissionsRequest,
} from "../../services/organization-people/update-user-permissions";

export const useUpdateUserPermissions = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["organization-update-user-permissions"],
		mutationFn: (params: UpdateUserPermissionsRequest) =>
			updateUserPermissions(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-user-permissions"],
				exact: false,
			});
		},

		onError: (error) => {
			console.error("Failed to update user permissions:", error);
		},
	});
};
