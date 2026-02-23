"use client";

import {
	BarChart3Icon,
	Book,
	BotIcon,
	ClipboardPlusIcon,
	CreditCardIcon,
	DatabaseIcon,
	EyeOffIcon,
	FileTextIcon,
	GalleryVerticalEnd,
	GitBranchIcon,
	HeartPulseIcon,
	ImageIcon,
	KeyRound,
	LayoutDashboardIcon,
	MicIcon,
	NetworkIcon,
	PillIcon,
	SearchIcon,
	Settings2Icon,
	ShieldCheckIcon,
	SparklesIcon,
	FileJson2Icon,
	UserRoundIcon,
	WatchIcon,
} from "lucide-react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/shadcn/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("sidebar");
	const { userInfo } = useAuthStore();
	const { pathname } = useLocation();

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
				name: t("management.architecture.title"),
				url: "/architecture",
				icon: NetworkIcon,
			},
			{
				name: t("management.integration.title"),
				url: "/integration",
				icon: LayoutDashboardIcon,
			},
		],
		playground: [
			{
				name: t("playground.ehrConverter.title"),
				url: "/ehr-converter",
				icon: FileJson2Icon,
			},
			{
				name: t("playground.documentToFhir.title"),
				url: "/document-to-fhir",
				icon: FileTextIcon,
			},
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
			{
				name: t("playground.voiceTranscribe.title"),
				url: "/voice-transcribe",
				icon: MicIcon,
			},
			{
				name: t("playground.medicalImage.title"),
				url: "/medical-image",
				icon: ImageIcon,
			},
			{
				name: t("playground.healthScore.title"),
				url: "/health-score",
				icon: HeartPulseIcon,
			},
			{
				name: t("playground.patientHistory.title"),
				url: "/patient-history",
				icon: UserRoundIcon,
			},
			{
				name: t("playground.wearableData.title"),
				url: "/wearable-data",
				icon: WatchIcon,
			},
			{
				name: t("playground.publicHealth.title"),
				url: "/public-health",
				icon: BarChart3Icon,
			},
			{
				name: t("playground.apiFlowBuilder.title"),
				url: "/api-flow-builder",
				icon: GitBranchIcon,
			},
		],
		tools: [
			{
				name: t("tools.knowledgeBase.title"),
				url: "/knowledge-base",
				icon: DatabaseIcon,
			},
			{
				name: t("tools.bhxhValidator.title"),
				url: "/bhxh-validator",
				icon: ShieldCheckIcon,
			},
			{
				name: t("tools.dataMasking.title"),
				url: "/data-masking",
				icon: EyeOffIcon,
			},
		],
		settings: [
			{
				name: t("settings.settings.title"),
				url: "/settings",
				icon: Settings2Icon,
			},
			{
				name: t("settings.billing.title"),
				url: "/billing",
				icon: CreditCardIcon,
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
				<NavProjects projects={data.tools} label={t("tools.title")} />
				<NavProjects projects={data.settings} label={t("settings.title")} />

				{/* Upgrade to Pro */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname === "/upgrade"}>
									<NavLink
										to="/upgrade"
										className="font-medium bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent"
									>
										<SparklesIcon className="text-violet-500" />
										<span>{t("settings.upgrade.title")}</span>
									</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<LocaleSwitcher className="mx-auto" />
				{data.user && <NavUser user={data.user} />}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
