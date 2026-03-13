import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Field, FieldGroup } from "@/components/shadcn/field";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const addMemeberFormSchema = z.object({
	email: z.email("Please enter a valid email address"),
});

type AddMemeberFormData = z.infer<typeof addMemeberFormSchema>;

type InvitationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const InvitationDialog: React.FC<InvitationDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AddMemeberFormData>({
		resolver: zodResolver(addMemeberFormSchema),
	});

	const onSubmit = (data: AddMemeberFormData) => {
		console.log("Form submitted with data:", data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Add new member</DialogTitle>
					<DialogDescription>
						Invite new member to join your organization by email.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter email address"
								{...register("email")}
								aria-invalid={errors.email ? "true" : "false"}
							/>
							{errors.email && (
								<p className="text-sm text-destructive mt-1" role="alert">
									{errors.email?.message}
								</p>
							)}
						</Field>
					</FieldGroup>
					<Button type="submit" className="mt-4 ml-auto block">
						Send Invitation
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default InvitationDialog;
