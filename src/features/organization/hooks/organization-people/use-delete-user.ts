import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteUser,
	type DeleteUserParams,
} from "../../services/organization-people/delete-user";

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["organization-delete-user"],
		mutationFn: (params: DeleteUserParams) => deleteUser(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-users"],
				exact: false,
			});
		},
		onError: (error) => {
			console.error("Failed to delete user:", error);
		},
	});
};
