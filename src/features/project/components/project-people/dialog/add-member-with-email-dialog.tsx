import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldGroup } from "@/components/shadcn/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { useImperativeHandle } from "react";

const addMemeberWithEmailDialogSchema = z.object({
	email: z.email("Invalid email address").min(1, "Email is required"),
	role: z.string().min(1, "Role is required"),
});

type AddMemberWithEmailDialogFormValues = z.infer<
	typeof addMemeberWithEmailDialogSchema
>;

type AddMemberWithEmailDialogRef = {
	submit: () => Promise<boolean>;
};

type AddMemberWithEmailDialogProps = {
	ref?: React.Ref<AddMemberWithEmailDialogRef>;
};

const AddMemberWithEmailDialog = ({ ref }: AddMemberWithEmailDialogProps) => {
	const {
		control,
		register,
		formState: { errors, isSubmitting },
		handleSubmit,
	} = useForm<AddMemberWithEmailDialogFormValues>({
		resolver: zodResolver(addMemeberWithEmailDialogSchema),
		defaultValues: {
			email: "",
			role: "member",
		},
	});

	const onSubmit = async (values: AddMemberWithEmailDialogFormValues) => {
		console.log(values);
		return true;
	};

	useImperativeHandle(ref, () => ({
		isSubmitting,
		submit: () => {
			return new Promise((resolve) => {
				handleSubmit(async (values) => {
					const result = await onSubmit(values);
					resolve(result);
				})();
			});
		},
	}));

	return (
		<form className="w-full mt-2">
			<FieldGroup>
				<Field>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder={"jane@example.com"}
						{...register("email")}
						aria-invalid={errors.email ? "true" : "false"}
					/>
					{errors.email && (
						<p className="text-sm text-destructive mt-1" role="alert">
							{errors.email?.message}
						</p>
					)}
				</Field>
				<Field>
					<Controller
						name="role"
						control={control}
						render={({ field }) => (
							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>

								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger id="role" className="w-full">
										<SelectValue>
											{field.value === "member" && (
												<p className="font-medium">Member</p>
											)}
											{field.value === "owner" && (
												<p className="font-medium">Owner</p>
											)}
										</SelectValue>
									</SelectTrigger>

									<SelectContent>
										<SelectGroup>
											<SelectItem value="member">
												<div className="flex flex-col">
													<p className="font-medium">Member</p>
													<p className="text-muted-foreground text-sm">
														Can read/write data. No direct member-management
														controls.
													</p>
												</div>
											</SelectItem>

											<SelectItem value="owner">
												<div className="flex flex-col">
													<p className="font-medium">Owner</p>
													<p className="text-muted-foreground text-sm">
														Full control: can manage project settings and
														members.
													</p>
												</div>
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						)}
					/>
				</Field>
			</FieldGroup>
		</form>
	);
};

export type { AddMemberWithEmailDialogRef };

export default AddMemberWithEmailDialog;
