import { Button } from "@/components/shadcn/button";
import { Field, FieldLabel } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Switch } from "@/components/shadcn/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import z from "zod";

const projectGeneralSchema = z.object({
	projectName: z.string().min(1, "Project name is required"),
	projectId: z.string().min(1, "Project ID is required"),
	disableAPIKeys: z.boolean(),
});

type ProjectGeneralFormData = z.infer<typeof projectGeneralSchema>;

const ProjectGeneralForm = () => {
	const { register, handleSubmit, control } = useForm<ProjectGeneralFormData>({
		resolver: zodResolver(projectGeneralSchema),
	});

	const onSubmit = (data: ProjectGeneralFormData) => {
		console.log("Form data:", data);
	};

	return (
		<div className="w-full">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="space-y-4 max-w-md mx-auto"
			>
				<Field>
					<FieldLabel htmlFor="projectName">Project Name</FieldLabel>
					<Input id="projectName" {...register("projectName")} />
				</Field>
				<Field>
					<FieldLabel htmlFor="projectId">Project ID</FieldLabel>
					<Input id="projectId" {...register("projectId")} disabled />
				</Field>
				<Controller
					name="disableAPIKeys"
					control={control}
					render={({ field }) => (
						<div className="flex items-center space-x-2">
							<Switch
								id="disableAPIKeys"
								checked={field.value}
								onCheckedChange={field.onChange}
							/>
							<FieldLabel htmlFor="disableAPIKeys">Disable API Keys</FieldLabel>
						</div>
					)}
				/>
				<Button type="submit">Save</Button>
			</form>
		</div>
	);
};

export default ProjectGeneralForm;
