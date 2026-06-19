import type * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/shadcn/sidebar";
import { useProjectStore } from "@/features/project/store/project";
import { cn } from "@/lib/utils";

export function TeamSwitcher({
	info,
}: {
	info: {
		organization: {
			name: string;
			logo: React.ElementType;
			defaultProject?: {
				name: string;
				id: string;
			};
		};
		projects?: {
			name: string;
			project_uuid: string;
		}[];
	};
}) {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();

	const setProjectId = useProjectStore((state) => state.setProjectId);
	const setProjectInfo = useProjectStore((state) => state.setProjectInfo);

	const projects = info.projects ?? [];
	const OrganizationLogo = info.organization.logo;

	const handleProjectSelect = (project: {
		project_uuid: string;
		name: string;
	}) => {
		setProjectId(project.project_uuid);
		setProjectInfo({
			name: project.name,
			description: undefined,
		});
		navigate(`/project/${project.project_uuid}/general`);
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<OrganizationLogo className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{info.organization.name}
								</span>
								<span className="truncate text-xs">
									{info.organization.defaultProject?.name}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Projects
						</DropdownMenuLabel>
						{projects.length > 0 ? (
							projects.map((project, index) => (
								<DropdownMenuItem
									key={project.project_uuid}
									onClick={() => handleProjectSelect(project)}
									className={cn(
										"gap-2 p-2 flex items-start justify-between",
										project.project_uuid ===
											info.organization.defaultProject?.id &&
											"bg-sidebar-accent text-sidebar-accent-foreground"
									)}
								>
									<div className="min-w-0 flex-1 flex flex-col items-start justify-start">
										<p className="w-full truncate font-medium">
											{project.name}
										</p>
										<p className="w-full truncate text-xs text-muted-foreground/80">
											{project.project_uuid}
										</p>
									</div>
									<DropdownMenuShortcut className="ml-2 shrink-0">
										⌘{index + 1}
									</DropdownMenuShortcut>
								</DropdownMenuItem>
							))
						) : (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem disabled className="gap-2 p-2">
									No projects
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
