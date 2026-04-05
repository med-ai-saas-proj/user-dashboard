import { Navigate, Outlet } from "react-router-dom";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { useAuthStore } from "@/features/auth/store/auth-store";

const ProjectRouteGuard = () => {
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const { data, isLoading } = useGetOrganizationProjects({
		organizationId,
		offset: 0,
		limit: 1,
	});

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
					<p className="mt-4 text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	if ((data?.total ?? 0) === 0) {
		return <Navigate to="/organization/projects" replace />;
	}

	return <Outlet />;
};

export default ProjectRouteGuard;
