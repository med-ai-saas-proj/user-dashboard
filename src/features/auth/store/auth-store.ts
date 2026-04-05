import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserInfo = {
	name: string;
	email: string;
	preferred_username?: string;
	given_name?: string;
	family_name?: string;
};

export type OrganizationInfo = {
	id: string;
	name: string;
};

interface AuthState {
	token: string | null;
	refreshToken: string | null;
	expiresAt: number | null;
	userInfo: UserInfo | null;
	organization: OrganizationInfo | null;
	setAuth: (token: string, refreshToken: string, expiresIn: number) => void;
	setToken: (token: string, expiresIn: number) => void;
	setUserInfo: (userInfo: UserInfo) => void;
	logout: () => void;
	isTokenExpired: () => boolean;
	setOrganization: (organization: OrganizationInfo | null) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			refreshToken: null,
			expiresAt: null,
			userInfo: null,
			organization: null,
			setAuth: (token, refreshToken, expiresIn) =>
				set({
					token,
					refreshToken,
					expiresAt: Date.now() + expiresIn * 1000,
				}),
			setToken: (token, expiresIn) =>
				set({
					token,
					expiresAt: Date.now() + expiresIn * 1000,
				}),
			setUserInfo: (userInfo) => set({ userInfo }),
			logout: () =>
				set({
					token: null,
					refreshToken: null,
					expiresAt: null,
					userInfo: null,
					organization: null,
				}),
			isTokenExpired: () => {
				const expiresAt = get().expiresAt;
				if (!expiresAt) return true;
				// Consider token expired if within 1 minute of expiry
				return Date.now() >= expiresAt - 60000;
			},
			setOrganization: (organization) => {
				set({ organization });
			},
		}),
		{
			name: "med--ai-saas-auth",
		}
	)
);
