import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	sendInvitation,
	type SendInvitationData,
} from "../../services/organization-people/send-invitation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useSendInvitation = () => {
	const queryClient = useQueryClient();
	const { t: tCommon } = useTranslation("common");

	return useMutation({
		mutationKey: ["sendInvitation"],
		mutationFn: (credentials: SendInvitationData) =>
			sendInvitation(credentials),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-invitations"],
			});
			toast.success(tCommon("requestDone"));
		},
		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to send invitation:", error);
		},
	});
};
