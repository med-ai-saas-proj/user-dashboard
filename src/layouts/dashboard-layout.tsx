import type { PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, PaletteIcon } from "lucide-react";
import { useStyleTheme } from "@/hooks/use-style-theme";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import { Separator } from "@/components/shadcn/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/shadcn/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { cn } from "@/lib/utils";

const DashboardLayout = ({
	children,
	pageTitle,
	headerRight,
	className,
}: PropsWithChildren<{
	pageTitle?: string;
	headerRight?: React.ReactNode;
	className?: string;
}>) => {
	const { resolvedTheme, setTheme } = useTheme();
	const { style, toggleStyle } = useStyleTheme();
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 bg-background z-50 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4 w-full">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">My Project</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{pageTitle}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
						<div className="ml-auto flex items-center gap-1.5">
							{headerRight}
							<button
								type="button"
								onClick={toggleStyle}
								className={cn(
									"p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground",
									style === "clinical"
										? "bg-primary/10 text-primary hover:bg-primary/20"
										: "hover:bg-muted"
								)}
								title={
									style === "clinical"
										? "Switch to default style"
										: "Switch to clinical style"
								}
							>
								<PaletteIcon className="size-4" />
							</button>
							<button
								type="button"
								onClick={() =>
									setTheme(resolvedTheme === "dark" ? "light" : "dark")
								}
								className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
								title={
									resolvedTheme === "dark"
										? "Switch to light mode"
										: "Switch to dark mode"
								}
							>
								{resolvedTheme === "dark" ? (
									<SunIcon className="size-4" />
								) : (
									<MoonIcon className="size-4" />
								)}
							</button>
						</div>
					</div>
				</header>

				<div className={cn("flex flex-1 flex-col gap-4 p-4 pt-0", className)}>
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
