import { Navigate, useLocation } from "react-router-dom";
import { useKeycloak } from "@/features/auth/providers/keycloak-provider";
import LoadingPage from "@/components/loading-page";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { authenticated, initialized } = useKeycloak();
	const location = useLocation();

	if (!initialized) {
		return <LoadingPage />;
	}

	if (!authenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
