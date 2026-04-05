import { useImperativeHandle, useMemo, useRef } from "react";
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
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/shadcn/combobox";
import { useGetUsers } from "@/features/organization/hooks/organization-people/use-get-users";
import { useTranslation } from "react-i18next";
import { useAddProjectUser } from "@/features/project/hooks/project-people/use-add-project-user";
import { useProjectStore } from "@/features/project/store/project";
import { useAuthStore } from "@/features/auth/store/auth-store";

const createAddMemberWithoutEmailDialogSchema = (messages: {
	userInvalid: string;
	roleInvalid: string;
}) =>
	z.object({
		userId: z.string().min(1, messages.userInvalid),
		role: z.string().min(1, messages.roleInvalid),
	});

type AddMemberWithoutEmailDialogFormValues = z.infer<
	ReturnType<typeof createAddMemberWithoutEmailDialogSchema>
>;

type AddMemberWithoutEmailDialogRef = {
	submit: () => Promise<boolean>;
};

type AddMemberWithoutEmailDialogProps = {
	ref?: React.Ref<AddMemberWithoutEmailDialogRef>;
};

const AddMemberWithoutEmailDialog = ({
	ref,
}: AddMemberWithoutEmailDialogProps) => {
	const { t } = useTranslation("project");
	const portalContainerRef = useRef<HTMLDivElement | null>(null);
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const fakeProjectId = useProjectStore((state) => state.projectId);
	const validationMessages = useMemo(
		() => ({
			userInvalid: t("people.dialog.without-email.userInvalid"),
			roleInvalid: t("people.dialog.roleInvalid"),
		}),
		[t]
	);
	const addMemeberWithoutEmailDialogSchema = useMemo(
		() => createAddMemberWithoutEmailDialogSchema(validationMessages),
		[validationMessages]
	);

	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<AddMemberWithoutEmailDialogFormValues>({
		resolver: zodResolver(addMemeberWithoutEmailDialogSchema),
		defaultValues: {
			userId: "",
			role: "member",
		},
	});

	const { data: users } = useGetUsers({
		organizationId,
	});
	const { mutate: addUser } = useAddProjectUser();

	const userLabelById = useMemo(() => {
		return Object.fromEntries(
			(users?.results ?? []).map((user) => [
				user.id,
				`${user.username} (${user.email})`,
			])
		);
	}, [users?.results]);

	const onSubmit = (values: AddMemberWithoutEmailDialogFormValues) => {
		addUser({
			projectId: fakeProjectId,
			userId: values.userId,
		});
		return true;
	};

	useImperativeHandle(ref, () => ({
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
			<FieldGroup ref={portalContainerRef} className="w-full max-w-sm gap-y-2">
				<Field>
					<Controller
						name="userId"
						control={control}
						render={({ field }) => (
							<div className="space-y-2">
								<Label htmlFor="userId">
									{t("people.dialog.without-email.userLabel")}
								</Label>

								<Combobox
									items={Object.values(userLabelById)}
									onValueChange={field.onChange}
									value={field.value}
								>
									<ComboboxInput
										id="userId"
										className="w-full"
										placeholder={t(
											"people.dialog.without-email.userPlaceholder"
										)}
										value={userLabelById[field.value]}
									/>
									<ComboboxContent portalContainer={portalContainerRef.current}>
										<ComboboxList>
											{users?.results.map((user) => (
												<ComboboxItem key={user.id} value={user.id}>
													{userLabelById[user.id]}
												</ComboboxItem>
											))}
										</ComboboxList>
										<ComboboxEmpty>
											{t("people.dialog.without-email.noUsers")}
										</ComboboxEmpty>
									</ComboboxContent>
								</Combobox>

								{errors.userId && (
									<p className="text-sm text-destructive">
										{errors.userId.message}
									</p>
								)}
							</div>
						)}
					/>
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
									<p className="text-sm text-destructive">
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

export type { AddMemberWithoutEmailDialogRef };

export default AddMemberWithoutEmailDialog;
