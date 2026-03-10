import { useMutation } from "@tanstack/react-query";
import {
	deleteUser,
	type DeleteUserParams,
} from "../../services/organization-people/delete-user";

export const useDeleteUser = () => {
	return useMutation({
		mutationKey: ["organization-delete-user"],
		mutationFn: (params: DeleteUserParams) => deleteUser(params),
		onSuccess: () => {
			console.log("User deleted successfully");
		},
		onError: (error) => {
			console.error("Error deleting user:", error);
		},
	});
};
