import { useIam } from "@/features/auth/providers/iam-provider";

export const useAuthStatus = () => {
	const { authenticated } = useIam();
	return authenticated;
};
