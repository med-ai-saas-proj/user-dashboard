import { useMutation } from "@tanstack/react-query";
import { useKeycloak } from "@/features/auth/providers/keycloak-provider";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useProjectStore } from "@/features/project/store/project";

export const useSignOut = () => {
	const { keycloak } = useKeycloak();
	const logout = useAuthStore((state) => state.logout);
	const resetProjectInformation = useProjectStore(
		(state) => state.resetProject
	);

	return useMutation({
		mutationFn: async () => {
			// Clear local state
			logout();
			resetProjectInformation();
			// Logout from Keycloak
			await keycloak.logout({
				redirectUri: `${window.location.origin}/login`,
			});
		},
	});
};
