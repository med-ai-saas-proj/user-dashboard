"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/shadcn/collapsible";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/shadcn/sidebar";
import { useIsActivePath } from "@/hooks/use-is-active-tab";

interface NavProjectsProps {
	label: string;
	projects: {
		name: string;
		url: string;
		icon?: LucideIcon;
		disableActive?: boolean;
	}[];
}

export function NavProjects({ label, projects }: NavProjectsProps) {
	const isActive = useIsActivePath();

	return (
		<Collapsible defaultOpen className="group/collapsible">
			<SidebarGroup className="group-data-[collapsible=icon]:hidden">
				<SidebarGroupLabel asChild>
					<CollapsibleTrigger>
						{label}
						<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
					</CollapsibleTrigger>
				</SidebarGroupLabel>
				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarMenu>
							{projects.map((item) => (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton
										asChild
										isActive={item.disableActive ? false : isActive(item.url)}
									>
										<NavLink to={item.url}>
											{item.icon && <item.icon />}
											<span>{item.name}</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	);
}
