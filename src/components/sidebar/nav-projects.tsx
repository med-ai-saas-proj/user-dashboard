"use client";

import { ChevronDown, type LucideIcon, StarIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
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
import { cn } from "@/lib/utils";

interface NavProjectsProps {
	label: string;
	projects: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
	hideLabel?: boolean;
	pinnable?: boolean;
	isPinned?: (url: string) => boolean;
	onTogglePin?: (url: string) => void;
}

interface NavItemProps {
	item: { name: string; url: string; icon: LucideIcon };
	isActive: boolean;
	pinnable?: boolean;
	pinned?: boolean;
	onTogglePin?: (url: string) => void;
}

function NavItem({
	item,
	isActive,
	pinnable,
	pinned,
	onTogglePin,
}: NavItemProps) {
	return (
		<SidebarMenuItem className="group/nav-item relative">
			<SidebarMenuButton asChild isActive={isActive}>
				<NavLink to={item.url} preventScrollReset>
					<item.icon />
					<span>{item.name}</span>
				</NavLink>
			</SidebarMenuButton>
			{pinnable && onTogglePin && (
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onTogglePin(item.url);
					}}
					aria-label={pinned ? `Unpin ${item.name}` : `Pin ${item.name}`}
					title={pinned ? "Unpin from Quick Access" : "Pin to Quick Access"}
					className={cn(
						"absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity",
						"text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
						pinned
							? "opacity-100 text-primary hover:text-primary"
							: "opacity-0 group-hover/nav-item:opacity-100 focus-visible:opacity-100"
					)}
				>
					<StarIcon className={cn("size-3.5", pinned && "fill-primary")} />
				</button>
			)}
		</SidebarMenuItem>
	);
}

export function NavProjects({
	label,
	projects,
	hideLabel,
	pinnable,
	isPinned,
	onTogglePin,
}: NavProjectsProps) {
	const { pathname } = useLocation();

	if (hideLabel) {
		return (
			<SidebarGroup className="group-data-[collapsible=icon]:hidden pt-0">
				<SidebarGroupContent>
					<SidebarMenu>
						{projects.map((item) => (
							<NavItem
								key={item.name}
								item={item}
								isActive={pathname === item.url}
								pinnable={pinnable}
								pinned={isPinned?.(item.url)}
								onTogglePin={onTogglePin}
							/>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

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
								<NavItem
									key={item.name}
									item={item}
									isActive={pathname === item.url}
									pinnable={pinnable}
									pinned={isPinned?.(item.url)}
									onTogglePin={onTogglePin}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	);
}
