import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteUser,
	type DeleteUserParams,
} from "../../services/project-people/delete-user";

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-delete-user"],
		mutationFn: (params: DeleteUserParams) => deleteUser(params),
		onSuccess: () => {
			console.log("User deleted successfully");
			queryClient.invalidateQueries({
				queryKey: ["project-users"],
				exact: false,
			});
		},
		onError: (error) => {
			console.error("Error deleting user:", error);
		},
	});
};
