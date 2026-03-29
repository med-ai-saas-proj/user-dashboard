import { useState } from "react";
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

const ArchiveProjectSchema = z.object({
	projectName: z.string(),
});

type ArchiveProjectFormData = z.infer<typeof ArchiveProjectSchema>;

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
	const { mutate: archiveProject } = useArchiveProject();

	const { register, control, handleSubmit } = useForm<ArchiveProjectFormData>({
		resolver: zodResolver(ArchiveProjectSchema),
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
				<DialogTitle>Archive {projectName}</DialogTitle>
				<DialogDescription>
					<p>
						By archiving, you will be removing access to all members of this
						project including yourself. All requests using project's API keys
						will be rejected. Archived projects cannot be restored.
					</p>
					<p className="font-semibold mt-1">
						To confirm, type "{projectName}" in the input box
					</p>
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Input
					placeholder="Confirm by typing the project's name"
					autoComplete="off"
					{...register("projectName")}
				/>
				{!isConfirmed && typedProjectName.length > 0 && (
					<p className="text-sm text-destructive mt-2">
						Project name does not match.
					</p>
				)}
				<DialogFooter className="mt-4">
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button
						type="submit"
						variant="default"
						disabled={!isConfirmed}
						className="bg-destructive"
					>
						Archive
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
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<Archive size={"16"} className="text-destructive" />
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
