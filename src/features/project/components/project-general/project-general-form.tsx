import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Switch } from "@/components/shadcn/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import z from "zod";

const createProjectGeneralSchema = (messages: {
	projectNameRequired: string;
	projectIdRequired: string;
}) =>
	z.object({
		projectName: z.string().min(1, messages.projectNameRequired),
		projectId: z.string().min(1, messages.projectIdRequired),
		disableAPIKeys: z.boolean(),
	});

type ProjectGeneralFormData = z.infer<
	ReturnType<typeof createProjectGeneralSchema>
>;

const ProjectGeneralForm = () => {
	const { t } = useTranslation("project");
	const validationMessages = useMemo(
		() => ({
			projectNameRequired: t("general.form.validation.projectNameRequired"),
			projectIdRequired: t("general.form.validation.projectIdRequired"),
		}),
		[t]
	);
	const projectGeneralSchema = useMemo(
		() => createProjectGeneralSchema(validationMessages),
		[validationMessages]
	);

	const { register, handleSubmit, control } = useForm<ProjectGeneralFormData>({
		resolver: zodResolver(projectGeneralSchema),
		defaultValues: {
			projectName: "demo",
			projectId: "123",
			disableAPIKeys: false,
		},
	});

	const onSubmit = (data: ProjectGeneralFormData) => {
		console.log("Form data:", data);
	};

	return (
		<div className="w-full">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4 max-w-md mx-auto"
			>
				<Field>
					<FieldLabel htmlFor="projectName">
						{t("general.form.fields.projectName")}
					</FieldLabel>
					<Input id="projectName" {...register("projectName")} />
				</Field>
				<Field>
					<FieldLabel htmlFor="projectId">
						{t("general.form.fields.projectId")}
					</FieldLabel>
					<Input id="projectId" {...register("projectId")} disabled />
				</Field>
				<Controller
					name="disableAPIKeys"
					control={control}
					render={({ field }) => (
						<div className="flex items-center space-x-2">
							<Switch
								id="disableAPIKeys"
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<FieldLabel htmlFor="disableAPIKeys">
								{t("general.form.fields.disableApiKeys")}
							</FieldLabel>
						</div>
					)}
				/>
				<Button type="submit">{t("general.form.actions.save")}</Button>
			</form>
		</div>
	);
};

export default ProjectGeneralForm;
