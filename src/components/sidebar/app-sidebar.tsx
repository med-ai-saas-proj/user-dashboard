"use client";

import {
	ActivityIcon,
	BarChart3Icon,
	Book,
	BotIcon,
	BrainIcon,
	ClipboardPlusIcon,
	CreditCardIcon,
	DatabaseIcon,
	DnaIcon,
	DropletIcon,
	EyeIcon,
	EyeOffIcon,
	FileHeartIcon,
	FileJson2Icon,
	FileTextIcon,
	GitBranchPlusIcon,
	GlobeIcon,
	HeartPulseIcon,
	ImageIcon,
	KeyRound,
	LayoutDashboardIcon,
	LayoutGridIcon,
	MapPinIcon,
	MicIcon,
	NetworkIcon,
	PillIcon,
	SearchIcon,
	Settings2Icon,
	ShieldCheckIcon,
	SparklesIcon,
	StethoscopeIcon,
	UserRoundIcon,
	WatchIcon,
} from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import veneraLogo from "@/assets/venera.png";
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
import { LocaleSwitcher } from "@/components/sidebar/locale-switcher";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { usePinnedFeatures } from "@/hooks/use-pinned-features";

function VeneraLogo({ className }: { className?: string }) {
	return <img src={veneraLogo} alt="Venera" className={className} />;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t } = useTranslation("sidebar");
	const { userInfo } = useAuthStore();
	const { pathname } = useLocation();
	const [playgroundSearch, setPlaygroundSearch] = useState("");
	const { isPinned, togglePin, pinned } = usePinnedFeatures();

	const data = {
		teams: [
			{
				name: "Venera AI Inc",
				logo: VeneraLogo,
				plan: "Enterprise",
			},
		],
		user: userInfo,
		management: [
			{
				name: t("management.apiKeys.title"),
				url: "/dashboard/api-keys",
				icon: KeyRound,
			},
			{
				name: t("management.apiReference.title"),
				url: "/dashboard/api-reference",
				icon: Book,
			},
			{
				name: t("management.architecture.title"),
				url: "/dashboard/architecture",
				icon: NetworkIcon,
			},
		],
		dataProcessing: [
			{
				name: t("dataProcessing.ehrConverter.title"),
				url: "/dashboard/ehr-converter",
				icon: FileJson2Icon,
			},
			{
				name: t("dataProcessing.ehrIngest.title"),
				url: "/dashboard/ehr-ingest",
				icon: GitBranchPlusIcon,
			},
			{
				name: t("dataProcessing.documentToFhir.title"),
				url: "/dashboard/document-to-fhir",
				icon: FileTextIcon,
			},
			{
				name: t("dataProcessing.bhxhValidator.title"),
				url: "/dashboard/bhxh-validator",
				icon: ShieldCheckIcon,
			},
			{
				name: t("dataProcessing.dataMasking.title"),
				url: "/dashboard/data-masking",
				icon: EyeOffIcon,
			},
			{
				name: t("dataProcessing.knowledgeBase.title"),
				url: "/dashboard/knowledge-base",
				icon: DatabaseIcon,
			},
			{
				name: "Gene Decoder",
				url: "/dashboard/gene-decoder",
				icon: DnaIcon,
			},
			{
				name: "Cross-Provider Search",
				url: "/dashboard/cross-search",
				icon: GlobeIcon,
			},
		],
		dataManagement: [
			{
				name: t("operation.healthcareDashboard.title"),
				url: "/dashboard/healthcare-dashboard",
				icon: ActivityIcon,
			},
			{
				name: t("dataManagement.wearableData.title"),
				url: "/dashboard/wearable-data",
				icon: WatchIcon,
			},
			{
				name: t("dataManagement.publicHealth.title"),
				url: "/dashboard/public-health",
				icon: BarChart3Icon,
			},
			{
				name: t("dataManagement.healthScore.title"),
				url: "/dashboard/health-score",
				icon: HeartPulseIcon,
			},
			{
				name: t("dataManagement.digitalTwin.title"),
				url: "/dashboard/digital-twin",
				icon: BrainIcon,
			},
		],
		operation: [
			{
				name: t("dataManagement.patientHistory.title"),
				url: "/dashboard/patient-history",
				icon: UserRoundIcon,
			},
			{
				name: t("operation.ehrSummary.title"),
				url: "/dashboard/ehr-summary",
				icon: ClipboardPlusIcon,
			},
			{
				name: "Ophthalmology Summary",
				url: "/dashboard/ophth-summary",
				icon: EyeIcon,
			},
			{
				name: "EHR Overview",
				url: "/dashboard/ehr-overview",
				icon: FileHeartIcon,
			},
			{
				name: "Patient Analytics",
				url: "/dashboard/patient-analytics",
				icon: ActivityIcon,
			},
			{
				name: t("operation.rxAdvisor.title"),
				url: "/dashboard/rx-advisor",
				icon: PillIcon,
			},
			{
				name: t("operation.chatBot.title"),
				url: "/dashboard/chat",
				icon: BotIcon,
			},
			{
				name: t("operation.aiSearch.title"),
				url: "/dashboard/ai-search",
				icon: SearchIcon,
			},
			{
				name: t("operation.voiceTranscribe.title"),
				url: "/dashboard/voice-transcribe",
				icon: MicIcon,
			},
			{
				name: t("operation.voiceAgent.title"),
				url: "/dashboard/voice-agent",
				icon: MicIcon,
			},
			{
				name: t("operation.medicalImage.title"),
				url: "/dashboard/medical-image",
				icon: ImageIcon,
			},
			{
				name: t("operation.symptomChecker.title"),
				url: "/dashboard/symptom-checker",
				icon: StethoscopeIcon,
			},
			{
				name: t("operation.clinicSearch.title"),
				url: "/dashboard/clinic-search",
				icon: MapPinIcon,
			},
			{
				name: "Blood Panel",
				url: "/dashboard/blood-panel",
				icon: DropletIcon,
			},
		],
		development: [
			{
				name: t("development.apiFlowBuilder.title"),
				url: "/dashboard/api-flow-builder",
				icon: GitBranchPlusIcon,
			},
			{
				name: t("development.dashboardBuilder.title"),
				url: "/dashboard/dashboard-builder",
				icon: LayoutGridIcon,
			},
			{
				name: t("development.federatedLearning.title"),
				url: "/dashboard/federated-learning",
				icon: NetworkIcon,
			},
			{
				name: t("development.integration.title"),
				url: "/dashboard/integration",
				icon: LayoutDashboardIcon,
			},
			{
				name: t("development.a2ui.title"),
				url: "/dashboard/a2ui",
				icon: LayoutDashboardIcon,
			},
		],
		settings: [
			{
				name: t("settings.settings.title"),
				url: "/dashboard/settings",
				icon: Settings2Icon,
			},
			{
				name: t("settings.billing.title"),
				url: "/dashboard/billing",
				icon: CreditCardIcon,
			},
		],
	};

	// All Playground items (the four groups under the Playground header) are
	// pinnable. Order pinned items by the user's pin order, not the source order.
	const playgroundItems = [
		...data.dataProcessing,
		...data.operation,
		...data.dataManagement,
		...data.development,
	];
	const itemByUrl = new Map(playgroundItems.map((i) => [i.url, i]));
	const quickAccessItems = pinned
		.map((url) => itemByUrl.get(url))
		.filter((item): item is (typeof playgroundItems)[number] => Boolean(item));

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

				{/* QUICK ACCESS — only renders when something is pinned */}
				{quickAccessItems.length > 0 && (
					<NavProjects
						projects={quickAccessItems}
						label="Quick Access"
						pinnable
						isPinned={isPinned}
						onTogglePin={togglePin}
					/>
				)}

				{/* PLAYGROUND */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden pb-0">
					<SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/70">
						Playground
					</SidebarGroupLabel>
					<div className="px-2 pb-1">
						<div className="relative">
							<SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search features..."
								value={playgroundSearch}
								onChange={(e) => setPlaygroundSearch(e.target.value)}
								className="w-full h-7 pl-7 pr-2 text-xs rounded-md border bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
							/>
						</div>
					</div>
				</SidebarGroup>
				<NavProjects
					projects={
						playgroundSearch
							? data.dataProcessing.filter((p) =>
									p.name.toLowerCase().includes(playgroundSearch.toLowerCase())
								)
							: data.dataProcessing
					}
					label={t("dataProcessing.title")}
					pinnable
					isPinned={isPinned}
					onTogglePin={togglePin}
				/>
				<NavProjects
					projects={
						playgroundSearch
							? data.operation.filter((p) =>
									p.name.toLowerCase().includes(playgroundSearch.toLowerCase())
								)
							: data.operation
					}
					label={t("operation.title")}
					pinnable
					isPinned={isPinned}
					onTogglePin={togglePin}
				/>
				<NavProjects
					projects={
						playgroundSearch
							? data.dataManagement.filter((p) =>
									p.name.toLowerCase().includes(playgroundSearch.toLowerCase())
								)
							: data.dataManagement
					}
					label={t("dataManagement.title")}
					pinnable
					isPinned={isPinned}
					onTogglePin={togglePin}
				/>
				<NavProjects
					projects={
						playgroundSearch
							? data.development.filter((p) =>
									p.name.toLowerCase().includes(playgroundSearch.toLowerCase())
								)
							: data.development
					}
					label={t("development.title")}
					pinnable
					isPinned={isPinned}
					onTogglePin={togglePin}
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
								<SidebarMenuButton
									asChild
									isActive={pathname === "/dashboard/upgrade"}
								>
									<NavLink
										to="/dashboard/upgrade"
										preventScrollReset
										className="font-medium bg-linear-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent"
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
