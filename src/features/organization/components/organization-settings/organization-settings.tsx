import type React from "react";
import { useGetOrganizationSettings } from "../../hooks/organization-settings/use-get-organization-settings";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { motion } from "framer-motion";
import { itemVariants, containerVariants } from "@/lib/animations";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { Skeleton } from "@/components/shadcn/skeleton";
import { useTranslation } from "react-i18next";

const MotionCard = motion.create(Card);

const OrganizationSettings = (): React.JSX.Element => {
	const { t } = useTranslation("setting");

	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const { data: setting, isLoading } =
		useGetOrganizationSettings(organizationId);

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible">
			<MotionCard variants={itemVariants} className="max-w-4xl mt-20 mx-auto">
				<CardHeader>
					<CardTitle className="text-2xl">{t("organization.title")}</CardTitle>
					<CardDescription className="text-base">
						{t("organization.description")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="rounded-md bg-muted p-4 flex flex-col gap-1">
							<p className="text-sm text-muted-foreground mb-2">Rate limit</p>
							{isLoading ? (
								<Skeleton className="h-5 w-24" />
							) : (
								<p className="text-base font-medium">
									{setting?.rate_limit ?? "—"}{" "}
									<span className="text-base text-black font-normal">
										req / min
									</span>
								</p>
							)}
						</div>
						<div className="rounded-md bg-muted p-4 flex flex-col gap-1">
							<p className="text-sm text-muted-foreground mb-2">
								Spending limit
							</p>
							{isLoading ? (
								<Skeleton className="h-5 w-24" />
							) : (
								<p className="text-base font-medium">
									{setting?.spending_limit != null
										? new Intl.NumberFormat("en-US", {
												style: "currency",
												currency: "USD",
											}).format(setting.spending_limit)
										: "—"}
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</MotionCard>
		</motion.div>
	);
};

export default OrganizationSettings;
