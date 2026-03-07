import { Languages } from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import { locales } from "@/config/i18n";
import { cn } from "@/lib/utils";

export interface LocaleSwitcherProps
	extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

const LocaleSwitcher = ({ className, ref, ...props }: LocaleSwitcherProps) => {
	const { i18n } = useTranslation();
	const currentLocale = i18n.language;

	const handleLocaleChange = (locale: string) => {
		i18n.changeLanguage(locale);
	};

	return (
		<div
			ref={ref}
			className={cn("flex items-center gap-2 px-2 py-2", className)}
			{...props}
		>
			<Languages className="size-4" />
			<div className="flex items-center gap-1">
				{locales.map((locale, index) => (
					<React.Fragment key={locale.code}>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleLocaleChange(locale.code)}
							className={cn(
								"h-6 px-2 py-0 text-xs",
								currentLocale === locale.code
									? "font-bold underline"
									: "font-normal"
							)}
						>
							{locale.label}
						</Button>
						{index < locales.length - 1 && (
							<span className="text-muted-foreground">|</span>
						)}
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

LocaleSwitcher.displayName = "LocaleSwitcher";

export { LocaleSwitcher };
