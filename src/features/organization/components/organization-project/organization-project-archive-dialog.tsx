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
import { Archive } from "lucide-react";
import { useArchiveProject } from "../../hooks/organization-projects/use-archive-project";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/shadcn/tooltip";

const createArchiveProjectSchema = (messages: {
	projectNameRequired: string;
}) =>
	z.object({
		projectName: z.string().min(1, messages.projectNameRequired),
	});

type ArchiveProjectFormData = z.infer<
	ReturnType<typeof createArchiveProjectSchema>
>;

type OrganizationProjectArchiveDialogProps = {
	projectId: string;
	projectName: string;
};

type ArchiveProjectDialogContentProps = {
	projectId: string;
	projectName: string;
};

const ArchiveProjectDialogContent = ({
	projectId,
	projectName,
}: ArchiveProjectDialogContentProps) => {
	const { t } = useTranslation("organization");
	const { mutate: archiveProject } = useArchiveProject();
	const validationMessages = useMemo(
		() => ({
			projectNameRequired: t(
				"project.archiveDialog.validation.projectNameRequired"
			),
		}),
		[t]
	);
	const archiveProjectSchema = useMemo(
		() => createArchiveProjectSchema(validationMessages),
		[validationMessages]
	);

	const { register, control, handleSubmit } = useForm<ArchiveProjectFormData>({
		resolver: zodResolver(archiveProjectSchema),
		defaultValues: {
			projectName: "",
		},
	});

	const typedProjectName = useWatch({
		control,
		name: "projectName",
		defaultValue: "",
	});

	const isConfirmed = typedProjectName === projectName;

	const onSubmit = (data: ArchiveProjectFormData) => {
		if (data.projectName !== projectName) {
			return;
		}

		archiveProject({ projectId });
	};

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{t("project.archiveDialog.title", { projectName })}
				</DialogTitle>
				<DialogDescription>
					<p>{t("project.archiveDialog.description")}</p>
					<p className="font-semibold mt-1">
						{t("project.archiveDialog.confirmInstruction", {
							projectName,
						})}
					</p>
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Input
					placeholder={t(
						"project.archiveDialog.fields.projectName.placeholder"
					)}
					autoComplete="off"
					{...register("projectName")}
				/>
				{!isConfirmed && typedProjectName.length > 0 && (
					<p className="text-sm text-destructive mt-2">
						{t("project.archiveDialog.validation.projectNameMismatch")}
					</p>
				)}
				<DialogFooter className="mt-4">
					<DialogClose asChild>
						<Button variant="outline">
							{t("project.archiveDialog.actions.cancel")}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						variant="default"
						disabled={!isConfirmed}
						className="bg-destructive"
					>
						{t("project.archiveDialog.actions.archive")}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
};

const OrganizationProjectArchiveDialog = ({
	projectId,
	projectName,
}: OrganizationProjectArchiveDialogProps) => {
	const { t } = useTranslation("organization");
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Tooltip>
					<TooltipTrigger asChild>
						<Archive size={"16"} className="text-destructive" />
					</TooltipTrigger>
					<TooltipContent>
						<p>{t("project.content.archive")}</p>
					</TooltipContent>
				</Tooltip>
			</DialogTrigger>
			{open && (
				<ArchiveProjectDialogContent
					projectId={projectId}
					projectName={projectName}
				/>
			)}
		</Dialog>
	);
};

export default OrganizationProjectArchiveDialog;
