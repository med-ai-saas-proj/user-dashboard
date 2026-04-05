import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import z from "zod";
import { useUpdateProject } from "../../hooks/project-general/use-update-project";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const createProjectGeneralSchema = (messages: {
	projectNameRequired: string;
	projectIdRequired: string;
}) =>
	z.object({
		projectName: z.string().min(1, messages.projectNameRequired),
		projectId: z.string().min(1, messages.projectIdRequired),
		projectDescription: z.string().optional(),
		// disableAPIKeys: z.boolean(),
	});

type ProjectGeneralFormData = z.infer<
	ReturnType<typeof createProjectGeneralSchema>
>;

const ProjectGeneralForm = () => {
	const { t } = useTranslation("project");
	const { t: tCommon } = useTranslation("common");

	const params = useParams();
	const projectId = params.projectId || "";

	const validationMessages = useMemo(
		() => ({
			projectNameRequired: t("general.form.validation.projectNameRequired"),
			projectIdRequired: t("general.form.validation.projectIdRequired"),
		}),
		[t]
	);

	const { mutate: updateProject, isPending } = useUpdateProject();

	const projectGeneralSchema = useMemo(
		() => createProjectGeneralSchema(validationMessages),
		[validationMessages]
	);

	const { register, handleSubmit } = useForm<ProjectGeneralFormData>({
		resolver: zodResolver(projectGeneralSchema),
		defaultValues: {
			projectName: "demo",
			projectId,
			projectDescription: "",
		},
	});

	const onSubmit = (data: ProjectGeneralFormData) => {
		updateProject(
			{
				projectId: data.projectId,
				projectName: data.projectName,
				projectDescription: data.projectDescription || undefined,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("requestDone"));
				},
			}
		);
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
				<Field>
					<FieldLabel htmlFor="projectDescription">
						{t("general.form.fields.projectDescription")}
					</FieldLabel>
					<Textarea
						id="projectDescription"
						{...register("projectDescription")}
						placeholder={t("general.form.fields.projectDescriptionPlaceholder")}
					/>
				</Field>
				<Button type="submit" disabled={isPending}>
					{t("general.form.actions.save")}
				</Button>
			</form>
		</div>
	);
};

export default ProjectGeneralForm;
