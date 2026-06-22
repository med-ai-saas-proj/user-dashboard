import { useTranslation } from "react-i18next";
import { locales } from "@/config/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Languages } from "lucide-react";

export interface LocaleSwitcherProps
	extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

const LocaleSwitcher = ({ className, ref, ...props }: LocaleSwitcherProps) => {
	const { i18n } = useTranslation();
	const currentLocale = i18n.language;

	return (
		<div
			ref={ref}
			className={cn("flex items-center gap-4", className)}
			{...props}
		>
			<Languages className="size-5" />
			<div className="flex items-center rounded-sm border border-muted-foreground/25 bg-white p-1 gap-1">
				{locales.map((locale) => {
					const isActive = currentLocale === locale.code;

					return (
						<button
							key={locale.code}
							type="button"
							className="relative px-4 py-1 text-sm font-semibold cursor-pointer"
							onClick={() => i18n.changeLanguage(locale.code)}
						>
							{isActive && (
								<motion.div
									layoutId="active-locale"
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 30,
									}}
									className="absolute inset-0 rounded-sm bg-black"
								/>
							)}

							<span
								className={cn(
									"relative z-10 transition-colors duration-200",
									isActive ? "text-white" : "text-black"
								)}
							>
								{locale.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

LocaleSwitcher.displayName = "LocaleSwitcher";

export { LocaleSwitcher };
