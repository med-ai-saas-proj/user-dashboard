"use client";

import { GalleryVerticalEnd } from "lucide-react";
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

export function SettingSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("setting");
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
				<NavProjects projects={data.settings} label={t("settings.title")} />
				<NavProjects
					projects={data.organization}
					label={t("organization.title")}
				/>
				<NavProjects projects={data.project} label={t("project.title")} />
			</SidebarContent>

			<SidebarFooter>
				<LocaleSwitcher className="mx-auto" />
				{data.user && <NavUser user={data.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
