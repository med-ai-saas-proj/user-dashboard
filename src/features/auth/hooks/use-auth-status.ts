import { useKeycloak } from "@/features/auth/providers/keycloak-provider";

export const useAuthStatus = () => {
	const { authenticated } = useKeycloak();
	return authenticated;
};
