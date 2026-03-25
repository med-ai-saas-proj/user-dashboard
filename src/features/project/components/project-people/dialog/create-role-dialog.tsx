import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
	DialogClose,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Field, FieldGroup } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useCreateRole } from "@/features/project/hooks/project-people/use-create-role";
import { useProjectStore } from "@/features/project/store/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

const CreateRoleDialogSchema = z.object({
	roleName: z.string().min(1, "Role name is required"),
	description: z.string(),
});

type CreateRoleDialogFormValues = z.infer<typeof CreateRoleDialogSchema>;

const CreateRoleDialog = () => {
	const fakeProjectId = useProjectStore((state) => state.projectId);
	const {
		register,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<CreateRoleDialogFormValues>({
		resolver: zodResolver(CreateRoleDialogSchema),
		defaultValues: {
			roleName: "",
			description: "",
		},
	});

	const { mutate: createRole } = useCreateRole();

	const [openDialog, setOpenDialog] = useState(false);

	const onSubmit = (values: CreateRoleDialogFormValues) => {
		createRole(
			{
				projectId: fakeProjectId,
				roleName: values.roleName,
				description: values.description,
			},
			{
				onSuccess: () => {
					setOpenDialog(false);
				},
			}
		);
	};

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogTrigger asChild>
				<Button variant="default" size="sm" className="mb-4">
					Create Role
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Role</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<Label>Role Name</Label>
							<Input {...register("roleName")} />
							{errors.roleName && (
								<p className="text-sm text-destructive mt-1">
									{errors.roleName.message}
								</p>
							)}
						</Field>
						<Field>
							<Label>Description</Label>
							<Input {...register("description")} />
							{errors.description && (
								<p className="text-sm text-destructive mt-1">
									{errors.description.message}
								</p>
							)}
						</Field>
					</FieldGroup>
					<DialogFooter className="mt-4">
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Close
							</Button>
						</DialogClose>
						<Button type="submit" variant="default" disabled={isSubmitting}>
							{isSubmitting ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateRoleDialog;
