import { useMutation } from "@tanstack/react-query";
import {
	resendInvitation,
	type ResendInvitationParams,
} from "../../services/organization-people/resend-invitation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const useResendInvitation = () => {
	const { t: tCommon } = useTranslation("common");
	return useMutation({
		mutationKey: ["resendInvitation"],
		mutationFn: (params: ResendInvitationParams) => resendInvitation(params),
		onError: (error) => {
			toast.error(tCommon("error"));
			console.error("Failed to resend invitation:", error);
		},
		onSuccess: () => {
			toast.success(tCommon("requestDone"));
		},
	});
};
