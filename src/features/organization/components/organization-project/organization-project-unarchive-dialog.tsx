import { useMemo, useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogFooter,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { ArchiveRestore } from "lucide-react";
import { useUnarchiveProject } from "../../hooks/organization-projects/use-unarchive-project";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/shadcn/tooltip";

const createUnarchiveProjectSchema = (messages: {
	projectNameRequired: string;
}) =>
	z.object({
		projectName: z.string().min(1, messages.projectNameRequired),
	});

type UnarchiveProjectFormData = z.infer<
	ReturnType<typeof createUnarchiveProjectSchema>
>;

type OrganizationProjectUnarchiveDialogProps = {
	projectId: string;
	projectName: string;
};

type UnarchiveProjectDialogContentProps = {
	projectId: string;
	projectName: string;
};

const UnarchiveProjectDialogContent = ({
	projectId,
	projectName,
}: UnarchiveProjectDialogContentProps) => {
	const { t } = useTranslation("organization");
	const { mutate: unarchiveProject } = useUnarchiveProject();
	const validationMessages = useMemo(
		() => ({
			projectNameRequired: t(
				"project.unarchiveDialog.validation.projectNameRequired"
			),
		}),
		[t]
	);
	const unarchiveProjectSchema = useMemo(
		() => createUnarchiveProjectSchema(validationMessages),
		[validationMessages]
	);

	const { register, control, handleSubmit } = useForm<UnarchiveProjectFormData>(
		{
			resolver: zodResolver(unarchiveProjectSchema),
			defaultValues: {
				projectName: "",
			},
		}
	);

	const typedProjectName = useWatch({
		control,
		name: "projectName",
		defaultValue: "",
	});

	const isConfirmed = typedProjectName === projectName;

	const onSubmit = (data: UnarchiveProjectFormData) => {
		if (data.projectName !== projectName) {
			return;
		}

		unarchiveProject({ projectId });
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{t("project.unarchiveDialog.title", { projectName })}
				</DialogTitle>
				<DialogDescription>
					<p>{t("project.unarchiveDialog.description")}</p>
					<p className="font-semibold mt-1">
						{t("project.unarchiveDialog.confirmInstruction", {
							projectName,
						})}
					</p>
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Input
					placeholder={t(
						"project.unarchiveDialog.fields.projectName.placeholder"
					)}
					autoComplete="off"
					{...register("projectName")}
				/>
				{!isConfirmed && typedProjectName.length > 0 && (
					<p className="text-sm text-destructive mt-2">
						{t("project.unarchiveDialog.validation.projectNameMismatch")}
					</p>
				)}
				<DialogFooter className="mt-4">
					<DialogClose asChild>
						<Button variant="outline">
							{t("project.unarchiveDialog.actions.cancel")}
						</Button>
					</DialogClose>
					<Button type="submit" variant="default" disabled={!isConfirmed}>
						{t("project.unarchiveDialog.actions.unarchive")}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
};

const OrganizationProjectUnarchiveDialog = ({
	projectId,
	projectName,
}: OrganizationProjectUnarchiveDialogProps) => {
	const { t } = useTranslation("organization");
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Tooltip>
					<TooltipTrigger asChild>
						<ArchiveRestore size={"16"} className="text-foreground" />
					</TooltipTrigger>
					<TooltipContent>
						<p>{t("project.content.unarchive")}</p>
					</TooltipContent>
				</Tooltip>
			</DialogTrigger>
			{open && (
				<UnarchiveProjectDialogContent
					projectId={projectId}
					projectName={projectName}
				/>
			)}
		</Dialog>
	);
};

export default OrganizationProjectUnarchiveDialog;
