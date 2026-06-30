import { Navigate, Outlet } from "react-router-dom";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { useAuthStore } from "@/features/auth/store/auth-store";
import LoadingPage from "@/components/loading-page";

const ProjectRouteGuard = () => {
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const { data, isLoading } = useGetOrganizationProjects({
		organizationId,
		offset: 0,
		limit: 1,
	});

	if (isLoading) {
		return <LoadingPage />;
	}

	if ((data?.total ?? 0) === 0) {
		return <Navigate to="/organization/projects" replace />;
	}

	return <Outlet />;
};

export default ProjectRouteGuard;
