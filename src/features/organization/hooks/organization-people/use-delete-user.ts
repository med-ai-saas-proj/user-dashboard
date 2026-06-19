import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	deleteUser,
	type DeleteUserParams,
} from "../../services/organization-people/delete-user";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationKey: ["organization-delete-user"],
		mutationFn: (params: DeleteUserParams) => deleteUser(params),
		onSuccess: () => {
			toast.success(tCommon("requestDone"));

			queryClient.invalidateQueries({
				queryKey: ["organization-users"],
				exact: false,
			});
		},
		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to delete user:", error);
		},
	});
};
