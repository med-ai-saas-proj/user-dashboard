import { useLocation } from "react-router-dom";

export function useIsActivePath() {
	const { pathname } = useLocation();

	const isActive = (basePath: string) => {
		return pathname === basePath || pathname.startsWith(`${basePath}/`);
	};

	return isActive;
}
