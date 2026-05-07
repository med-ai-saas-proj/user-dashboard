import type * as React from "react";
import { useEffect } from "react";
import {
	Book,
	BotIcon,
	ChartColumnBig,
	ClipboardPlusIcon,
	GalleryVerticalEnd,
	PillIcon,
	SearchIcon,
	Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar,
} from "@/components/shadcn/sidebar";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useGetProjectDetails } from "@/features/project/hooks/project-general/use-get-project-details";
import { useParams } from "react-router-dom";
import { useProjectStore } from "@/features/project/store/project";
import { useGetOrganizationProjects } from "@/features/organization/hooks/organization-projects/use-get-projects";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("sidebar");
	const { userInfo, organization } = useAuthStore();
	const { state } = useSidebar();

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

	const selectedProjectName = storedProjectInfo.name ?? projectDetails?.name;
	const selectedProjectDescription =
		storedProjectInfo.description ?? projectDetails?.description;

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
				name: organization?.name || "Acme Inc",
				logo: GalleryVerticalEnd,
				defaultProject: {
					name: selectedProjectName || "Choose a Project",
					id: projectId,
				},
			},
			projects: projectList?.results.map((project) => ({
				name: project.name,
				id: project.id,
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
			{
				name: t("management.settings.title"),
				url: "/settings",
				icon: Settings,
			},
		],
		playground: [
			{
				name: t("playground.ehrSummary.title"),
				url: "/ehr-summary",
				icon: ClipboardPlusIcon,
			},
			{
				name: t("playground.rxAdvisor.title"),
				url: "/rx-advisor",
				icon: PillIcon,
			},
			{
				name: t("playground.chatBot.title"),
				url: "/chat",
				icon: BotIcon,
			},
			{
				name: t("playground.aiSearch.title"),
				url: "/ai-search",
				icon: SearchIcon,
			},
		],
		organization: [
			{
				name: t("organization.people.title"),
				url: "/organization/people",
			},
			{
				name: t("organization.project.title"),
				url: "/organization/projects",
			},
			{
				name: t("organization.billing.title"),
				url: "/organization/billing",
			},
		],
		project: [
			{
				name: t("project.general.title"),
				url: projectId
					? `/project/${projectId}/general`
					: "/organization/projects",
				disableActive: !projectId,
			},
			{
				name: t("project.people.title"),
				url: projectId
					? `/project/${projectId}/people`
					: "/organization/projects",
				disableActive: !projectId,
			},
			{
				name: t("project.apiKeys.title"),
				url: projectId
					? `/project/${projectId}/api-keys`
					: "/organization/projects",
				disableActive: !projectId,
			},
			{
				name: t("project.buckets.title"),
				url: projectId
					? `/project/${projectId}/buckets`
					: "/organization/projects",
				disableActive: !projectId,
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
				<NavProjects projects={data.playground} label={t("playground.title")} />
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
				{state === "expanded" && (
					<LocaleSwitcher className="mx-auto invisible sm:visible" />
				)}
				{data.user && <NavUser user={data.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
