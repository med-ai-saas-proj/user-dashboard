import {
	Book,
	ChartColumnBig,
	GalleryVerticalEnd,
	Users,
	Folder,
	CreditCard,
	Settings,
	UserRound,
	KeyRound,
	Database,
	ClipboardClock,
} from "lucide-react";
import type * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	// useSidebar,
} from "@/components/shadcn/sidebar";
// import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";
import { useGetProjectDetails } from "@/features/project/hooks/project-general/use-get-project-details";
import { useProjectStore } from "@/features/project/store/project";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("sidebar");
	const { userInfo, organization } = useAuthStore();
	// const { state } = useSidebar();

	const params = useParams();
	const { data: projectList } = useGetOrganizationProjects({
		organizationId: organization?.id || "",
	});
	const storedProjectId = useProjectStore((state) => state.projectId);
	const storedProjectInfo = useProjectStore((state) => state.projectInfo);
	const setProjectId = useProjectStore((state) => state.setProjectId);
	const setProjectInfo = useProjectStore((state) => state.setProjectInfo);

	const projectId = params.projectId ?? storedProjectId ?? "";
	const { data: projectDetails } = useGetProjectDetails(projectId);

	const selectedProjectName = projectDetails?.name || storedProjectInfo.name;
	const selectedProjectDescription =
		projectDetails?.description || storedProjectInfo.description;

	useEffect(() => {
		if (!organization?.id) {
			return;
		}

		if (projectId && projectId !== storedProjectId) {
			setProjectId(projectId);
		}

		if (
			selectedProjectName &&
			(selectedProjectName !== storedProjectInfo.name ||
				selectedProjectDescription !== storedProjectInfo.description)
		) {
			setProjectInfo({
				name: selectedProjectName,
				description: selectedProjectDescription || undefined,
			});
		}
	}, [
		organization?.id,
		projectId,
		selectedProjectName,
		selectedProjectDescription,
		storedProjectId,
		storedProjectInfo,
		setProjectId,
		setProjectInfo,
	]);

	// Tabs

	const data = {
		info: {
			organization: {
				name: organization?.name || "",
				logo: GalleryVerticalEnd,
				defaultProject: {
					name: selectedProjectName || "Choose a Project",
					id: projectId,
				},
			},
			projects: projectList?.results.map((project) => ({
				name: project.name,
				project_uuid: project.project_uuid,
			})),
		},
		user: userInfo,

		management: [
			{
				name: t("management.dashboard.title"),
				url: "/dashboard",
				icon: ChartColumnBig,
			},
			{
				name: t("management.apiReference.title"),
				url: "/api-reference",
				icon: Book,
			},
		],

		organization: [
			{
				name: t("organization.people.title"),
				url: "/organization/people",
				icon: Users,
			},
			{
				name: t("organization.project.title"),
				url: "/organization/projects",
				icon: Folder,
			},
			{
				name: t("organization.billing.title"),
				url: "/organization/billing",
				icon: CreditCard,
			},
			{
				name: t("organization.logging.title"),
				url: "/organization/logging",
				icon: ClipboardClock,
			},
			{
				name: t("organization.settings.title"),
				url: "/organization/settings",
				icon: Settings,
			},
		],

		project: [
			{
				name: t("project.general.title"),
				url: projectId
					? `/project/${projectId}/general`
					: "/organization/projects",
				disableActive: !projectId,
				icon: Folder,
			},
			{
				name: t("project.people.title"),
				url: projectId
					? `/project/${projectId}/people`
					: "/organization/projects",
				disableActive: !projectId,
				icon: UserRound,
			},
			{
				name: t("project.apiKeys.title"),
				url: projectId
					? `/project/${projectId}/api-keys`
					: "/organization/projects",
				disableActive: !projectId,
				icon: KeyRound,
			},
			{
				name: t("project.buckets.title"),
				url: projectId
					? `/project/${projectId}/buckets`
					: "/organization/projects",
				disableActive: !projectId,
				icon: Database,
			},
			{
				name: t("project.settings.title"),
				url: projectId
					? `/project/${projectId}/settings`
					: "/organization/projects",
				disableActive: !projectId,
				icon: Settings,
			},
		],
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher info={data.info} />
			</SidebarHeader>
			<SidebarContent>
				<NavProjects projects={data.management} label={t("management.title")} />
				<NavProjects
					projects={data.organization}
					label={t("organization.title")}
				/>
				{/* Only show projects nav if there's a project selected, to avoid confusion since you can't really do anything here if there's no projects */}
				{projectId && (
					<NavProjects projects={data.project} label={t("project.title")} />
				)}
			</SidebarContent>

			<SidebarFooter>
				{/* {state === "expanded" && (
					<LocaleSwitcher className="mx-auto invisible sm:visible" />
				)} */}
				{data.user && <NavUser user={data.user} info={data.info} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
