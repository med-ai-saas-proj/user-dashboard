import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateUserPermissions,
	type UpdateUserPermissionsRequest,
} from "../../services/organization-people/update-user-permissions";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useUpdateUserPermissions = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationKey: ["organization-update-user-permissions"],
		mutationFn: (params: UpdateUserPermissionsRequest) =>
			updateUserPermissions(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-user-permissions"],
				exact: false,
			});
			toast.success(tCommon("requestDone"));
		},

		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to update user permissions:", error);
		},
	});
};
