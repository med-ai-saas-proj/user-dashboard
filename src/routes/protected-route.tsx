import { Navigate, useLocation } from "react-router-dom";
import { useIam } from "@/features/auth/providers/iam-provider";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { authenticated, initialized } = useIam();
	const location = useLocation();

	if (!initialized) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
					<p className="mt-4 text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if (!authenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return <>{children}</>;
};
