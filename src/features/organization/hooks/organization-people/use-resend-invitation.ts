import { useMutation } from "@tanstack/react-query";
import {
	resendInvitation,
	type ResendInvitationParams,
} from "../../services/organization-people/resend-invitation";

export const useResendInvitation = () => {
	return useMutation({
		mutationKey: ["organization-resend-invitation"],
		mutationFn: (params: ResendInvitationParams) => resendInvitation(params),
		onError: (error) => {
			console.error("Failed to resend invitation:", error);
		},
	});
};
