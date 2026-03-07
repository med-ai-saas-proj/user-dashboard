import { useMutation } from "@tanstack/react-query";
import { useKeycloak } from "@/features/auth/providers/keycloak-provider";
import { useAuthStore } from "@/features/auth/store/auth-store";

export const useSignOut = () => {
	const { keycloak } = useKeycloak();
	const logout = useAuthStore((state) => state.logout);

	return useMutation({
		mutationFn: async () => {
			// Clear local state
			logout();
			// Logout from Keycloak
			await keycloak.logout({
				redirectUri: `${window.location.origin}/login`,
			});
		},
	});
};
