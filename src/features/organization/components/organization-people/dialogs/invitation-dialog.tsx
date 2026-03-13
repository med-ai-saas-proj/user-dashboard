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
import { useTranslation } from "react-i18next";

type AddMemeberFormData = {
	email: string;
};

type InvitationDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const InvitationDialog: React.FC<InvitationDialogProps> = ({
	open,
	onOpenChange,
}) => {
	const { t } = useTranslation("organization");

	const addMemeberFormSchema = z.object({
		email: z.email(t("people.dialog.emailInvalid")),
	});

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
					<DialogTitle>{t("people.dialog.title")}</DialogTitle>
					<DialogDescription>
						{t("people.dialog.description")}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<Label htmlFor="email">{t("people.dialog.emailLabel")}</Label>
							<Input
								id="email"
								type="email"
								placeholder={t("people.dialog.emailPlaceholder")}
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
						{t("people.dialog.submit")}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default InvitationDialog;
