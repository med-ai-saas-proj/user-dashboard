import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addProjectUser,
	type AddProjectUserParams,
} from "../../services/project-people/add-user";

export const useAddUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["project-add-user"],
		mutationFn: (credentials: AddProjectUserParams) =>
			addProjectUser(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-users"],
				exact: false,
			});
		},
	});
};
