"use client";

import {
	Book,
	BotIcon,
	ChartColumnBig,
	ClipboardPlusIcon,
	GalleryVerticalEnd,
	KeyRound,
	PillIcon,
	SearchIcon,
	Settings,
} from "lucide-react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/shadcn/sidebar";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("sidebar");
	const { userInfo } = useAuthStore();

	const data = {
		teams: [
			{
				name: "Acme Inc",
				logo: GalleryVerticalEnd,
				plan: "Enterprise",
			},
		],
		user: userInfo,
		management: [
			{
				name: t("management.dashboard.title"),
				url: "/dashboard",
				icon: ChartColumnBig,
			},
			{
				name: t("management.apiKeys.title"),
				url: "/api-keys",
				icon: KeyRound,
			},
			{
				name: t("management.apiReference.title"),
				url: "/api-reference",
				icon: Book,
			},
			{
				name: t("management.settings.title"),
				url: "/settings/organization/general",
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
		settings: [
			{
				name: t("settings.profile.title"),
				url: "/settings/profile",
			},
		],
		organization: [
			{
				name: t("organization.general.title"),
				url: "/settings/organization/general",
			},
			{
				name: t("organization.apiKeys.title"),
				url: "/settings/organization/api-keys",
			},
			{
				name: t("organization.people.title"),
				url: "/settings/organization/people",
			},
			{
				name: t("organization.project.title"),
				url: "/settings/organization/projects",
			},
			{
				name: t("organization.billing.title"),
				url: "/settings/organization/billing",
			},
		],
		project: [
			{
				name: t("project.general.title"),
				url: "/settings/project/general",
			},
			{
				name: t("project.apiKeys.title"),
				url: "/settings/project/api-keys",
			},
			{
				name: t("project.people.title"),
				url: "/settings/project/people",
			},
		],
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavProjects projects={data.management} label={t("management.title")} />
				<NavProjects projects={data.playground} label={t("playground.title")} />
				<NavProjects
					projects={data.organization}
					label={t("organization.title")}
				/>
				<NavProjects projects={data.project} label={t("project.title")} />
				<NavProjects projects={data.settings} label={t("settings.title")} />
			</SidebarContent>

			<SidebarFooter>
				<LocaleSwitcher className="mx-auto" />
				{data.user && <NavUser user={data.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
