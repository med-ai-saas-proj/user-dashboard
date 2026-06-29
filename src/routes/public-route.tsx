import { Navigate, useLocation } from "react-router-dom";
import { useKeycloak } from "@/features/auth/providers/keycloak-provider";
import LoadingPage from "@/components/loading-page";

interface PublicRouteProps {
	children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
	const { authenticated, initialized } = useKeycloak();
	const location = useLocation();

	if (!initialized) {
		return <LoadingPage />;
	}

	if (authenticated) {
		const from = location.state?.from?.pathname || "/";
		return <Navigate to={from} replace />;
	}

	return <>{children}</>;
};
