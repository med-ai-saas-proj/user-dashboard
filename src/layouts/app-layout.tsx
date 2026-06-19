import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/shadcn/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

/**
 * AppLayout wraps all protected routes and provides the sidebar.
 * This layout persists across route navigation, preventing unnecessary re-renders.
 */
export function AppLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
