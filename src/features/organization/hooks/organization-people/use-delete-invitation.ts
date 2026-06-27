import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitation } from "../../services/organization-people/delete-invitation";
import type { DeleteInvitationParams } from "../../services/organization-people/delete-invitation";

export const useDeleteInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["organization-delete-invitation"],
		mutationFn: (params: DeleteInvitationParams) => deleteInvitation(params),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-invitations"],
				exact: false,
			});
		},
		onError: (error) => {
			console.error("Failed to delete invitation:", error);
		},
	});
};
