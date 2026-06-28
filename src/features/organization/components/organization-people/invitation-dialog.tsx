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
import { useSendInvitation } from "@/features/organization/hooks/organization-people/use-send-invitation";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { toast } from "sonner";
import { Spinner } from "@/components/shadcn/spinner";

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
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const { t } = useTranslation("organization");
	const { t: tCommon } = useTranslation("common");

	const { mutate: sendInvitation, isPending } = useSendInvitation();

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
		sendInvitation(
			{
				organizationId: organizationId,
				email: data.email,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
					toast.success(tCommon("requestDone"));
				},
			}
		);
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
					<Button
						type="submit"
						className="mt-4 ml-auto flex items-center gap-2"
						disabled={isPending}
					>
						{isPending && <Spinner />}
						{t("people.dialog.submit")}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default InvitationDialog;
