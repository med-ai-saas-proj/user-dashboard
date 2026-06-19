import { ChevronsUpDown, Languages, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/shadcn/sidebar";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import type { UserInfo } from "@/features/auth/store/auth-store";
import { useTranslation } from "react-i18next";
import { locales } from "@/config/i18n";
import { cn } from "@/lib/utils";

export function NavUser({ user }: { user: UserInfo }) {
	const { isMobile } = useSidebar();
	const { mutate: signOut } = useSignOut();
	const { i18n } = useTranslation();
	const currentLocale = i18n.language;

	const avatarText = user.preferred_username
		? user.preferred_username.substring(0, 2).toUpperCase()
		: "U";

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback>{avatarText}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{user.preferred_username}
								</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback>{avatarText}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{user.preferred_username}
									</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							{locales.map((locale) => (
								<DropdownMenuItem
									key={locale.code}
									onClick={() => i18n.changeLanguage(locale.code)}
									className={cn(
										"gap-2",
										currentLocale === locale.code && "bg-accent font-medium"
									)}
								>
									<Languages className="size-4" />
									{locale.label === "EN" ? "English" : "Tiếng Việt"}
									{currentLocale === locale.code && (
										<span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
									)}
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOut />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
