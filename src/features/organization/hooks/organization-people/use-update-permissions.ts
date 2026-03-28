import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updatePermissions,
	type UpdatePermissionsRequest,
} from "../../services/organization-people/update-permissions";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useUpdatePermissions = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationKey: ["updatePermissions"],
		mutationFn: (params: UpdatePermissionsRequest) => updatePermissions(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-permissions"],
				exact: false,
			});
			toast.success(tCommon("requestDone"));
		},

		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to delete user:", error);
		},
	});
};
