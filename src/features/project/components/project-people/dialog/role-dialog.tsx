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
import { useUpdateRole } from "@/features/project/hooks/project-people/use-update-role";
import { useProjectStore } from "@/features/project/store/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Textarea } from "@/components/shadcn/textarea";

const RoleDialogSchema = z.object({
	roleName: z.string().min(1, "Role name is required"),
	description: z.string(),
});

type RoleDialogFormValues = z.infer<typeof RoleDialogSchema>;
type RoleDialogProps = {
	mode?: "create" | "edit";
	roleId?: string;
	roleName?: string;
	roleDescription?: string;
	triggerElement?: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const RoleDialog = ({
	mode = "create",
	roleId,
	roleName,
	roleDescription,
	triggerElement,
	open,
	onOpenChange,
}: RoleDialogProps) => {
	const fakeProjectId = useProjectStore((state) => state.projectId);
	const {
		register,
		formState: { errors, isSubmitting },
		handleSubmit,
		reset,
	} = useForm<RoleDialogFormValues>({
		resolver: zodResolver(RoleDialogSchema),
		defaultValues: {
			roleName: "",
			description: "",
		},
	});

	useEffect(() => {
		if (!open) return;

		if (mode === "edit") {
			reset({
				roleName: roleName || "",
				description: roleDescription || "",
			});
			return;
		}

		reset({
			roleName: "",
			description: "",
		});
	}, [open, mode, roleName, roleDescription, reset]);

	const { mutate: createRole } = useCreateRole();
	const { mutate: updateRole } = useUpdateRole();

	const onSubmit = (values: RoleDialogFormValues) => {
		if (mode === "create") {
			createRole(
				{
					projectId: fakeProjectId,
					roleName: values.roleName,
					description: values.description,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				}
			);
		} else if (mode === "edit" && roleId) {
			updateRole(
				{
					projectId: fakeProjectId,
					roleId: roleId,
					roleName: values.roleName,
					description: values.description,
				},
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				}
			);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{triggerElement && (
				<DialogTrigger asChild>{triggerElement}</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create Role" : "Edit Role"}
					</DialogTitle>
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
							<Textarea {...register("description")} />
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
							{isSubmitting
								? "Saving..."
								: mode === "create"
									? "Create"
									: "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default RoleDialog;
