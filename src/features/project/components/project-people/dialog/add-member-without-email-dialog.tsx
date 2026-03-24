import { useMemo, useRef } from "react";
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
import { useOrganizationStore } from "@/features/organization/store/organization";

const addMemeberWithoutEmailDialogSchema = z.object({
	userId: z.string().min(1, "User is required"),
	role: z.string().min(1, "Role is required"),
});

type AddMemberWithoutEmailDialogFormValues = z.infer<
	typeof addMemeberWithoutEmailDialogSchema
>;

const AddMemberWithoutEmailDialog = () => {
	const portalContainerRef = useRef<HTMLDivElement | null>(null);
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);

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
		organizationId: fakeOrgId,
	});

	const userLabelById = useMemo(() => {
		return Object.fromEntries(
			(users?.results ?? []).map((user) => [
				user.id,
				`${user.username} (${user.email})`,
			])
		);
	}, [users?.results]);

	return (
		<form
			className="w-full mt-2"
			onSubmit={handleSubmit((values) => console.log(values))}
		>
			<FieldGroup ref={portalContainerRef} className="w-full max-w-sm gap-y-2">
				<Field>
					<Controller
						name="userId"
						control={control}
						render={({ field }) => (
							<div className="space-y-2">
								<Label htmlFor="userId">User</Label>

								<Combobox
									items={Object.values(userLabelById)}
									onValueChange={field.onChange}
									value={field.value}
								>
									<ComboboxInput
										id="userId"
										className="w-full"
										placeholder="Select a user"
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
										<ComboboxEmpty>No users found.</ComboboxEmpty>
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

export default AddMemberWithoutEmailDialog;
