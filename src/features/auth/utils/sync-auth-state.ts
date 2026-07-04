import keycloak from "@/config/keycloak";
import {
	type OrganizationInfo,
	useAuthStore,
	type UserInfo,
} from "@/features/auth/store/auth-store";

const extractOrganizationFromToken = (
	tokenParsed: UserInfo | undefined
): OrganizationInfo | null => {
	if (!tokenParsed) return null;

	const organizationClaim = (tokenParsed as Record<string, unknown>)
		.organization;

	if (!organizationClaim || typeof organizationClaim !== "object") {
		return null;
	}

	const entries = Object.entries(organizationClaim as Record<string, unknown>);
	if (entries.length === 0) {
		return null;
	}

	const [name, details] = entries[0];
	if (!details || typeof details !== "object") {
		return null;
	}

	const id = (details as { id?: unknown }).id;
	if (typeof id !== "string" || id.length === 0) {
		return null;
	}

	return { id, name };
};

export const syncAuthStateFromKeycloakToken = () => {
	const token = keycloak.token;
	const refreshToken = keycloak.refreshToken;
	const tokenParsed = keycloak.tokenParsed as UserInfo | undefined;

	if (!token || !refreshToken || !tokenParsed) {
		return false;
	}

	const expiresIn = tokenParsed.exp
		? tokenParsed.exp - Math.floor(Date.now() / 1000)
		: 3600;

	const { setAuth, setUserInfo, setOrganization } = useAuthStore.getState();
	setAuth(token, refreshToken, expiresIn);
	setUserInfo(tokenParsed);
	setOrganization(extractOrganizationFromToken(tokenParsed));

	return true;
};
