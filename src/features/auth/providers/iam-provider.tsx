import axios from "axios";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { IAM_ROUTES, isDesktop } from "@/config/iam";
import { type UserInfo, useAuthStore } from "@/features/auth/store/auth-store";

interface IamTokenPayload {
	id?: string;
	email?: string;
	fullName?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	preferred_username?: string;
	expiredAt?: number;
	exp?: number;
	[key: string]: unknown;
}

interface IamAuthResponse {
	data?: {
		tokenPayload?: IamTokenPayload;
	};
}

interface IamContextType {
	initialized: boolean;
	authenticated: boolean;
	user: UserInfo | null;
	signOut: () => Promise<void>;
	refresh: () => Promise<boolean>;
}

const IamContext = createContext<IamContextType | undefined>(undefined);

const tokenPayloadToUserInfo = (payload: IamTokenPayload): UserInfo => {
	const email = payload.email ?? "";
	const fullName = payload.fullName ?? payload.name ?? "";
	return {
		name: fullName || email,
		email,
		preferred_username: payload.preferred_username ?? email,
		given_name: payload.given_name,
		family_name: payload.family_name,
	};
};

const DESKTOP_USER: UserInfo = {
	name: "Desktop User",
	email: "desktop@venera.local",
	preferred_username: "desktop-user",
	given_name: "Desktop",
	family_name: "User",
};

export const IamProvider = ({ children }: { children: ReactNode }) => {
	const [initialized, setInitialized] = useState(false);
	const [authenticated, setAuthenticated] = useState(false);
	const setUserInfo = useAuthStore((state) => state.setUserInfo);
	const clearAuth = useAuthStore((state) => state.logout);
	const user = useAuthStore((state) => state.userInfo);

	const refresh = useCallback(async (): Promise<boolean> => {
		try {
			const response = await axios.post<IamAuthResponse>(
				IAM_ROUTES.REFRESH,
				null,
				{ withCredentials: true }
			);
			const payload = response.data?.data?.tokenPayload;
			if (payload) {
				setUserInfo(tokenPayloadToUserInfo(payload));
			}
			setAuthenticated(true);
			return true;
		} catch {
			clearAuth();
			setAuthenticated(false);
			return false;
		}
	}, [clearAuth, setUserInfo]);

	const signOut = useCallback(async () => {
		try {
			await axios.post(IAM_ROUTES.LOGOUT, null, { withCredentials: true });
		} catch {
			// Ignore — server may already consider us logged out; we still clear locally.
		}
		clearAuth();
		setAuthenticated(false);
	}, [clearAuth]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap once on mount
	useEffect(() => {
		if (isDesktop) {
			setUserInfo(DESKTOP_USER);
			setAuthenticated(true);
			setInitialized(true);
			return;
		}

		void refresh().finally(() => setInitialized(true));
	}, []);

	return (
		<IamContext.Provider
			value={{ initialized, authenticated, user, signOut, refresh }}
		>
			{initialized ? children : <div>Loading...</div>}
		</IamContext.Provider>
	);
};

export const useIam = () => {
	const context = useContext(IamContext);
	if (!context) {
		throw new Error("useIam must be used within IamProvider");
	}
	return context;
};
