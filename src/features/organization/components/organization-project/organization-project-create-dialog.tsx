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
import { useOrganizationStore } from "../../store/organization";

const CreateProjectSchema = z.object({
	name: z.string().min(1, "Project name is required"),
	description: z.string().min(1, "Project description is required"),
});

type CreateProjectFormData = z.infer<typeof CreateProjectSchema>;

const OrganizationProjectCreateDialog = () => {
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateProjectFormData>({
		resolver: zodResolver(CreateProjectSchema),
	});

	const { mutate: createProject } = useCreateProject();

	const onSubmit = (data: CreateProjectFormData) => {
		createProject({
			organizationId: fakeOrgId,
			projectName: data.name,
			projectDescription: data.description,
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="default">Create Project</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a new project</DialogTitle>
					<DialogDescription>
						Projects are shared environments where teams can collaborate and
						share API resources.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup className="flex flex-col items-center gap-y-4">
						<Field>
							<FieldLabel>Name</FieldLabel>
							<FieldDescription>
								Human-friendly label for your project, shown in user interfaces.
							</FieldDescription>
							<Input placeholder="Enter project name" {...register("name")} />
							{errors.name && (
								<p className="text-sm text-destructive mt-1">
									{errors.name.message}
								</p>
							)}
						</Field>
						<Field>
							<FieldLabel>Description</FieldLabel>
							<FieldDescription>
								A brief description of your project.
							</FieldDescription>
							<Input
								placeholder="Enter project description"
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
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button variant="default">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default OrganizationProjectCreateDialog;
