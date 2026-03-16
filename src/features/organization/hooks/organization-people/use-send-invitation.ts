import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	sendInvitation,
	type SendInvitationData,
} from "../../services/organization-people/send-invitation";

export const useSendInvitation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["sendInvitation"],
		mutationFn: (credentials: SendInvitationData) =>
			sendInvitation(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-invitations"],
			});
		},
	});
};
