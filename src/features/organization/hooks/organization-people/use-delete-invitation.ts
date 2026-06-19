import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitation } from "../../services/organization-people/delete-invitation";
import type { DeleteInvitationParams } from "../../services/organization-people/delete-invitation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useDeleteInvitation = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationKey: ["organization-delete-invitation"],
		mutationFn: (params: DeleteInvitationParams) => deleteInvitation(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-invitations"],
				exact: false,
			});
			toast.success(tCommon("requestDone"));
		},
		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to delete invitation:", error);
		},
	});
};
