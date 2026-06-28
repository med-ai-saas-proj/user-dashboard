import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProject } from "../../hooks/organization-projects/use-create-project";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/shadcn/spinner";

const createProjectSchema = (messages: {
	projectNameRequired: string;
	projectDescriptionRequired: string;
}) =>
	z.object({
		name: z.string().min(1, messages.projectNameRequired),
		description: z.string().min(1, messages.projectDescriptionRequired),
	});

type CreateProjectFormData = z.infer<ReturnType<typeof createProjectSchema>>;

const OrganizationProjectCreateDialog = () => {
	const { t } = useTranslation("organization");
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const validationMessages = useMemo(
		() => ({
			projectNameRequired: t(
				"project.createDialog.validation.projectNameRequired"
			),
			projectDescriptionRequired: t(
				"project.createDialog.validation.projectDescriptionRequired"
			),
		}),
		[t]
	);
	const projectSchema = useMemo(
		() => createProjectSchema(validationMessages),
		[validationMessages]
	);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const { mutate: createProject, isPending } = useCreateProject();
	const [openDialog, setOpenDialog] = useState(false);

	const onSubmit = (data: CreateProjectFormData) => {
		createProject(
			{
				organizationId,
				projectName: data.name,
				projectDescription: data.description,
			},
			{
				onSuccess: () => {
					reset();
					setOpenDialog(false);
					toast.success(t("project.toast.createSuccess"));
				},
			}
		);
	};

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogTrigger asChild>
				<Button variant="default">
					<PlusIcon />
					{t("project.createDialog.actions.trigger")}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("project.createDialog.title")}</DialogTitle>
					<DialogDescription>
						{t("project.createDialog.description")}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup className="flex flex-col items-center gap-y-4">
						<Field>
							<FieldLabel>
								{t("project.createDialog.fields.name.label")}
							</FieldLabel>
							<FieldDescription>
								{t("project.createDialog.fields.name.description")}
							</FieldDescription>
							<Input
								placeholder={t("project.createDialog.fields.name.placeholder")}
								{...register("name")}
							/>
							{errors.name && (
								<p className="text-sm text-destructive mt-1">
									{errors.name.message}
								</p>
							)}
						</Field>
						<Field>
							<FieldLabel>
								{t("project.createDialog.fields.description.label")}
							</FieldLabel>
							<FieldDescription>
								{t("project.createDialog.fields.description.description")}
							</FieldDescription>
							<Input
								placeholder={t(
									"project.createDialog.fields.description.placeholder"
								)}
								{...register("description")}
							/>
							{errors.description && (
								<p className="text-sm text-destructive mt-1">
									{errors.description.message}
								</p>
							)}
						</Field>
					</FieldGroup>
					<DialogFooter className="mt-4">
						<DialogClose asChild>
							<Button variant="outline">
								{t("project.createDialog.actions.cancel")}
							</Button>
						</DialogClose>
						<Button
							variant="default"
							type="submit"
							disabled={isPending}
							className="flex items-center gap-2"
						>
							{isPending && <Spinner />}
							{t("project.createDialog.actions.create")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default OrganizationProjectCreateDialog;
