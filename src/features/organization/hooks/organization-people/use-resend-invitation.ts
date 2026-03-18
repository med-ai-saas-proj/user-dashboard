import { useMutation } from "@tanstack/react-query";
import {
	resendInvitation,
	type ResendInvitationParams,
} from "../../services/organization-people/resend-invitation";

export const useResendInvitation = () => {
	return useMutation({
		mutationKey: ["resendInvitation"],
		mutationFn: (params: ResendInvitationParams) => resendInvitation(params),
	});
};
