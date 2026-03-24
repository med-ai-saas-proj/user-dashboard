"use client";

import {
	BarChart3Icon,
	Book,
	BotIcon,
	ClipboardPlusIcon,
	CreditCardIcon,
	DatabaseIcon,
	DnaIcon,
	DropletIcon,
	EyeOffIcon,
	FileTextIcon,
	GitBranchPlusIcon,
	GlobeIcon,
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
	LayoutGridIcon,
	StethoscopeIcon,
	MapPinIcon,
	ActivityIcon,
	BrainIcon,
} from "lucide-react";
import type * as React from "react";
import { useTranslation } from "react-i18next";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
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
				name: "Venera AI Inc",
				logo: SparklesIcon,
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
		],
		dataProcessing: [
			{
				name: t("dataProcessing.ehrConverter.title"),
				url: "/ehr-converter",
				icon: FileJson2Icon,
			},
			{
				name: t("dataProcessing.documentToFhir.title"),
				url: "/document-to-fhir",
				icon: FileTextIcon,
			},
			{
				name: t("dataProcessing.bhxhValidator.title"),
				url: "/bhxh-validator",
				icon: ShieldCheckIcon,
			},
			{
				name: t("dataProcessing.dataMasking.title"),
				url: "/data-masking",
				icon: EyeOffIcon,
			},
			{
				name: t("dataProcessing.knowledgeBase.title"),
				url: "/knowledge-base",
				icon: DatabaseIcon,
			},
			{
				name: "Gene Decoder",
				url: "/gene-decoder",
				icon: DnaIcon,
			},
			{
				name: "Cross-Provider Search",
				url: "/cross-search",
				icon: GlobeIcon,
			},
		],
		dataManagement: [
			{
				name: t("operation.healthcareDashboard.title"),
				url: "/healthcare-dashboard",
				icon: ActivityIcon,
			},
			{
				name: t("dataManagement.wearableData.title"),
				url: "/wearable-data",
				icon: WatchIcon,
			},
			{
				name: t("dataManagement.publicHealth.title"),
				url: "/public-health",
				icon: BarChart3Icon,
			},
			{
				name: t("dataManagement.healthScore.title"),
				url: "/health-score",
				icon: HeartPulseIcon,
			},
			{
				name: t("dataManagement.digitalTwin.title"),
				url: "/digital-twin",
				icon: BrainIcon,
			},
		],
		operation: [
			{
				name: t("dataManagement.patientHistory.title"),
				url: "/patient-history",
				icon: UserRoundIcon,
			},
			{
				name: t("operation.ehrSummary.title"),
				url: "/ehr-summary",
				icon: ClipboardPlusIcon,
			},
			{
				name: t("operation.rxAdvisor.title"),
				url: "/rx-advisor",
				icon: PillIcon,
			},
			{
				name: t("operation.chatBot.title"),
				url: "/chat",
				icon: BotIcon,
			},
			{
				name: t("operation.aiSearch.title"),
				url: "/ai-search",
				icon: SearchIcon,
			},
			{
				name: t("operation.voiceTranscribe.title"),
				url: "/voice-transcribe",
				icon: MicIcon,
			},
			{
				name: t("operation.medicalImage.title"),
				url: "/medical-image",
				icon: ImageIcon,
			},
			{
				name: t("operation.symptomChecker.title"),
				url: "/symptom-checker",
				icon: StethoscopeIcon,
			},
			{
				name: t("operation.clinicSearch.title"),
				url: "/clinic-search",
				icon: MapPinIcon,
			},
			{
				name: "Blood Panel",
				url: "/blood-panel",
				icon: DropletIcon,
			},
		],
		development: [
			{
				name: t("development.apiFlowBuilder.title"),
				url: "/api-flow-builder",
				icon: GitBranchPlusIcon,
			},
			{
				name: t("development.dashboardBuilder.title"),
				url: "/dashboard-builder",
				icon: LayoutGridIcon,
			},
			{
				name: t("development.federatedLearning.title"),
				url: "/federated-learning",
				icon: NetworkIcon,
			},
			{
				name: t("development.integration.title"),
				url: "/integration",
				icon: LayoutDashboardIcon,
			},
			{
				name: t("development.a2ui.title"),
				url: "/a2ui",
				icon: LayoutDashboardIcon,
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
				{/* MANAGEMENT */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden pb-0">
					<SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/70">
						{t("management.title")}
					</SidebarGroupLabel>
				</SidebarGroup>
				<NavProjects
					projects={data.management}
					label={t("management.title")}
					hideLabel
				/>

				{/* PLAYGROUND */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden pb-0">
					<SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/70">
						Playground
					</SidebarGroupLabel>
				</SidebarGroup>
				<NavProjects
					projects={data.dataProcessing}
					label={t("dataProcessing.title")}
				/>
				<NavProjects projects={data.operation} label={t("operation.title")} />
				<NavProjects
					projects={data.dataManagement}
					label={t("dataManagement.title")}
				/>
				<NavProjects
					projects={data.development}
					label={t("development.title")}
				/>

				{/* SETTINGS */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden pb-0">
					<SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/70">
						{t("settings.title")}
					</SidebarGroupLabel>
				</SidebarGroup>
				<NavProjects
					projects={data.settings}
					label={t("settings.title")}
					hideLabel
				/>

				{/* Upgrade to Pro */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild isActive={pathname === "/upgrade"}>
									<NavLink
										to="/upgrade"
										preventScrollReset
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
