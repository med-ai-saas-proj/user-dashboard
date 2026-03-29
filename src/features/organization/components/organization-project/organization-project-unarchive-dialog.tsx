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
import { ArchiveRestore } from "lucide-react";
import { useUnarchiveProject } from "../../hooks/organization-projects/use-unarchive-project";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const UnarchiveProjectSchema = z.object({
	projectName: z.string(),
});

type UnarchiveProjectFormData = z.infer<typeof UnarchiveProjectSchema>;

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
	const { mutate: unarchiveProject } = useUnarchiveProject();

	const { register, control, handleSubmit } = useForm<UnarchiveProjectFormData>(
		{
			resolver: zodResolver(UnarchiveProjectSchema),
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
				<DialogTitle>Unarchive {projectName}</DialogTitle>
				<DialogDescription>
					<p>
						By unarchiving, members with access to this project will be able to
						use the project API keys again. You can archive this project again
						at any time.
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
					<Button type="submit" variant="default" disabled={!isConfirmed}>
						Unarchive
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
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>
				<ArchiveRestore size={"16"} className="text-foreground" />
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
