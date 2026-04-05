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
import { useImperativeHandle, useMemo } from "react";
import { useTranslation } from "react-i18next";

const createAddMemberWithEmailDialogSchema = (messages: {
	emailInvalid: string;
	roleInvalid: string;
}) =>
	z.object({
		email: z
			.string()
			.min(1, messages.emailInvalid)
			.email(messages.emailInvalid),
		role: z.string().min(1, messages.roleInvalid),
	});

type AddMemberWithEmailDialogFormValues = z.infer<
	ReturnType<typeof createAddMemberWithEmailDialogSchema>
>;

type AddMemberWithEmailDialogRef = {
	submit: () => Promise<boolean>;
};

type AddMemberWithEmailDialogProps = {
	ref?: React.Ref<AddMemberWithEmailDialogRef>;
};

const AddMemberWithEmailDialog = ({ ref }: AddMemberWithEmailDialogProps) => {
	const { t } = useTranslation("project");
	const validationMessages = useMemo(
		() => ({
			emailInvalid: t("people.dialog.with-email.emailInvalid"),
			roleInvalid: t("people.dialog.roleInvalid"),
		}),
		[t]
	);
	const addMemeberWithEmailDialogSchema = useMemo(
		() => createAddMemberWithEmailDialogSchema(validationMessages),
		[validationMessages]
	);

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
					<Label htmlFor="email">
						{t("people.dialog.with-email.emailLabel")}
					</Label>
					<Input
						id="email"
						type="email"
						placeholder={t("people.dialog.with-email.emailPlaceholder")}
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
								<Label htmlFor="role">{t("people.dialog.roleLabel")}</Label>

								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger id="role" className="w-full">
										<SelectValue>
											{field.value === "member" && (
												<p className="font-medium">
													{t("people.dialog.roles.member.name")}
												</p>
											)}
											{field.value === "owner" && (
												<p className="font-medium">
													{t("people.dialog.roles.owner.name")}
												</p>
											)}
										</SelectValue>
									</SelectTrigger>

									<SelectContent>
										<SelectGroup>
											<SelectItem value="member">
												<div className="flex flex-col">
													<p className="font-medium">
														{t("people.dialog.roles.member.name")}
													</p>
													<p className="text-muted-foreground text-sm">
														{t("people.dialog.roles.member.description")}
													</p>
												</div>
											</SelectItem>

											<SelectItem value="owner">
												<div className="flex flex-col">
													<p className="font-medium">
														{t("people.dialog.roles.owner.name")}
													</p>
													<p className="text-muted-foreground text-sm">
														{t("people.dialog.roles.owner.description")}
													</p>
												</div>
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
								{errors.role && (
									<p className="text-sm text-destructive mt-1" role="alert">
										{errors.role.message}
									</p>
								)}
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
