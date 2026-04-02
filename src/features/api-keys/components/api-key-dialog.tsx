import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { useCreateApiKey } from "@/features/api-keys/hooks/use-create-api-key";
import { useServiceApiKeyStore } from "@/features/api-keys/store/service-api-key.store";
import { APIKeySaveDialog } from "./api-key-save-dialog";
import { useParams } from "react-router-dom";
import { useGetApiKeyPermissions } from "../hooks/use-get-api-permissions";

const apiCreationSchema = z.object({
	name: z.string().min(1, "Name must be at least 1 character long"),
	permissions: z
		.array(z.string())
		.min(1, "Please select at least one permission"),
});

type ApiCreationFormData = z.infer<typeof apiCreationSchema>;

const APIKeyDialog = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const params = useParams();
	const projectId = params.projectId;

	const setSelectedApiKey = useServiceApiKeyStore(
		(state) => state.setSelectedApiKey
	);
	const createApiKeyMutation = useCreateApiKey();
	const { data: apiKeyPermissions } = useGetApiKeyPermissions();

	const [openSave, setOpenSave] = useState(false);
	const [createdKey, setCreatedKey] = useState<string>("");

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ApiCreationFormData>({
		resolver: zodResolver(apiCreationSchema),
		defaultValues: {
			name: "",
			permissions: [],
		},
	});

	const onSubmit = async (data: ApiCreationFormData) => {
		const response = await createApiKeyMutation.mutateAsync({
			name: data.name,
			description: "",
			project_id: projectId || "",
			permissions: data.permissions,
		});

		// Automatically set this as the service API key
		setSelectedApiKey(response.key);
		setCreatedKey(response.key);

		setOpenSave(true);
		onOpenChange(false);
	};

	return (
		<div>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{tApiKeys("dialog.title")}</DialogTitle>
						<DialogDescription>
							{tApiKeys("dialog.description")}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid gap-4">
							<div className="grid gap-3">
								<Label>{tApiKeys("dialog.form.nameLabel")}</Label>
								<Input
									id="name"
									placeholder={tApiKeys("dialog.form.namePlaceholder")}
									aria-invalid={!!errors.name}
									{...register("name")}
								/>
								{errors.name && (
									<div className="h-5 mt-1.5 px-4">
										<p className="text-destructive text-xs">
											{errors.name.message}
										</p>
									</div>
								)}
							</div>

							<div className="grid gap-3">
								<Label>{tApiKeys("table.header.permissions")}</Label>
								<Controller
									name="permissions"
									control={control}
									render={({ field }) => (
										<div className="space-y-2">
											{apiKeyPermissions?.results?.map((permission) => {
												const isChecked =
													field.value?.includes(permission) ?? false;

												return (
													<div
														key={permission}
														className="flex items-center gap-2"
													>
														<Checkbox
															id={permission}
															checked={isChecked}
															onCheckedChange={(checked) => {
																if (checked) {
																	field.onChange([
																		...(field.value ?? []),
																		permission,
																	]);
																	return;
																}

																field.onChange(
																	(field.value ?? []).filter(
																		(value) => value !== permission
																	)
																);
															}}
														/>
														<Label htmlFor={permission}>{permission}</Label>
													</div>
												);
											})}
										</div>
									)}
								/>
								{errors.permissions && (
									<div className="h-5 mt-1.5 px-4">
										<p className="text-destructive text-xs">
											{errors.permissions.message}
										</p>
									</div>
								)}
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">{tCommon("action.cancel")}</Button>
							</DialogClose>
							<Button type="submit" disabled={createApiKeyMutation.isPending}>
								{createApiKeyMutation.isPending
									? tApiKeys("dialog.form.action.creating")
									: tApiKeys("dialog.form.action.create")}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<APIKeySaveDialog
				open={openSave}
				onOpenChange={setOpenSave}
				apiKey={createdKey}
			/>
		</div>
	);
};

export default APIKeyDialog;
