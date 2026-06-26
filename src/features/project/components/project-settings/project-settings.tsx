import type React from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../../store/project";
import { useGetProjectSettings } from "../../hooks/project-settings/use-get-project-settings";
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
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { useTranslation } from "react-i18next";
import { useUpdateProjectSettings } from "../../hooks/project-settings/use-update-project-settings";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/dashboard-layout";

const MotionCard = motion.create(Card);

// ── Schema ────────────────────────────────────────────────────────────────────

const projectSettingsSchema = z.object({
	rate_limit: z
		.number({ message: "Rate limit must be a number" })
		.positive("Rate limit must be greater than 0"),
	spending_limit: z
		.number({ message: "Spending limit must be a number" })
		.nonnegative("Spending limit must be 0 or more"),
});

type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;

// ── Update Dialog ─────────────────────────────────────────────────────────────

interface UpdateSettingsDialogProps {
	defaultValues: {
		rate_limit?: number | null;
		spending_limit?: number | null;
	};
	onSubmit: (values: ProjectSettingsFormValues) => void;
	isPending: boolean;
}

const UpdateSettingsDialog = ({
	defaultValues,
	onSubmit,
	isPending,
}: UpdateSettingsDialogProps): React.JSX.Element => {
	const { t } = useTranslation("setting");
	const [open, setOpen] = useState(false);

	const { control, handleSubmit, reset } = useForm<ProjectSettingsFormValues>({
		resolver: zodResolver(projectSettingsSchema),
		defaultValues: {
			rate_limit: defaultValues.rate_limit ?? undefined,
			spending_limit: defaultValues.spending_limit ?? undefined,
		},
	});

	const handleOpenChange = (next: boolean) => {
		if (!next) reset();
		setOpen(next);
	};

	const onValid = (values: ProjectSettingsFormValues) => {
		onSubmit(values);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline" className="gap-2">
					<Pencil className="h-4 w-4" />
					{t("project.form.header")}
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("project.form.title")}</DialogTitle>
					<DialogDescription>{t("project.form.description")}</DialogDescription>
				</DialogHeader>

				<form id="project-settings-form" onSubmit={handleSubmit(onValid)}>
					<FieldGroup className="py-2">
						<Controller
							name="rate_limit"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="project-rate-limit">
										{t("project.form.rate_limit")}
									</FieldLabel>
									<div className="relative">
										<Input
											{...field}
											id="project-rate-limit"
											type="number"
											min={1}
											placeholder={t("project.form.rate_limit_placeholder")}
											aria-invalid={fieldState.invalid}
											className="pr-20"
											onChange={(e) => field.onChange(e.target.valueAsNumber)}
										/>
										<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
											req / min
										</span>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<Controller
							name="spending_limit"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="project-spending-limit">
										{t("project.form.spending_limit")}
									</FieldLabel>
									<div className="relative">
										<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
											$
										</span>
										<Input
											{...field}
											id="project-spending-limit"
											type="number"
											min={0}
											step="0.01"
											placeholder={t("project.form.spending_limit_placeholder")}
											aria-invalid={fieldState.invalid}
											className="pl-6"
											onChange={(e) => field.onChange(e.target.valueAsNumber)}
										/>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isPending}
					>
						{t("project.form.cancel")}
					</Button>
					<Button
						type="submit"
						form="project-settings-form"
						disabled={isPending}
					>
						{isPending
							? t("project.form.saving")
							: t("project.form.save_changes")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// ── Main component ────────────────────────────────────────────────────────────

const ProjectSettings = (): React.JSX.Element => {
	const { t } = useTranslation("setting");

	const params = useParams();
	const projectId =
		useProjectStore((state) => state.projectId) || params.projectId || "";
	const { data: setting, isLoading } = useGetProjectSettings(projectId);
	const { mutate: updateSettings, isPending } =
		useUpdateProjectSettings(projectId);

	return (
		<DashboardLayout pageTitle={t("project.title")}>
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<MotionCard variants={itemVariants} className="max-w-4xl mt-20 mx-auto">
					<CardHeader className="flex flex-row items-start justify-between gap-4">
						<div className="space-y-1">
							<CardTitle className="text-2xl">{t("project.title")}</CardTitle>
							<CardDescription className="text-base">
								{t("project.description")}
							</CardDescription>
						</div>

						{!isLoading && (
							<UpdateSettingsDialog
								defaultValues={{
									rate_limit: setting?.rate_limit,
									spending_limit: setting?.spending_limit,
								}}
								onSubmit={(values) => updateSettings(values)}
								isPending={isPending}
							/>
						)}
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
		</DashboardLayout>
	);
};

export default ProjectSettings;
