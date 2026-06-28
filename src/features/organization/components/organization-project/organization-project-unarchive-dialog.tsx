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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/shadcn/spinner";

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
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	triggerButton?: React.ReactNode;
};

type UnarchiveProjectDialogContentProps = {
	projectId: string;
	projectName: string;
	onOpenChange?: (open: boolean) => void;
};

const UnarchiveProjectDialogContent = ({
	projectId,
	projectName,
	onOpenChange,
}: UnarchiveProjectDialogContentProps) => {
	const { t } = useTranslation("organization");
	const queryClient = useQueryClient();

	const { mutate: unarchiveProject, isPending } = useUnarchiveProject();
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

		unarchiveProject(
			{ projectId },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["project-details", projectId],
					});
					onOpenChange?.(false);
					toast.success(t("project.toast.unarchiveSuccess"));
				},
			}
		);
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
					<Button
						type="submit"
						variant="default"
						disabled={!isConfirmed || isPending}
						className="flex items-center gap-2"
					>
						{isPending && <Spinner />}
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
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: OrganizationProjectUnarchiveDialogProps) => {
	const { t } = useTranslation("organization");
	const [internalOpen, setInternalOpen] = useState(false);

	const open = controlledOpen ?? internalOpen;
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger>
				{controlledOpen === undefined && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button type="button">
								<ArchiveRestore size={"16"} className="text-foreground" />
							</button>
						</TooltipTrigger>
						<TooltipContent>
							<p>{t("project.content.unarchive")}</p>
						</TooltipContent>
					</Tooltip>
				)}
			</DialogTrigger>
			{open && (
				<UnarchiveProjectDialogContent
					projectId={projectId}
					projectName={projectName}
					onOpenChange={onOpenChange}
				/>
			)}
		</Dialog>
	);
};

export default OrganizationProjectUnarchiveDialog;
