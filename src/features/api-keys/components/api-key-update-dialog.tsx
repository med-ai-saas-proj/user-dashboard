import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
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
import { Textarea } from "@/components/shadcn/textarea";
import type { APIKey } from "@/features/api-keys/api-key.type";
import { useUpdateApiKey } from "@/features/api-keys/hooks/use-update-api-key";
import { useGetApiKeyPermissions } from "../hooks/use-get-api-key-permissions";
import { toast } from "sonner";
import type { ApiPermission } from "../services/api-key.dto";

const apiUpdateSchema = z.object({
	name: z.string().min(1, "Name must be at least 1 character long"),
	description: z.string().optional(),
	permissions: z
		.array(z.string())
		.min(1, "Please select at least one permission"),
});

type ApiUpdateFormData = z.infer<typeof apiUpdateSchema>;

const APIKeyUpdateDialog = ({
	apikey,
	open,
	onOpenChange,
}: {
	apikey: APIKey;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const { data: apiPermissions } = useGetApiKeyPermissions();
	const apiKeyUpdateMutation = useUpdateApiKey();

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ApiUpdateFormData>({
		resolver: zodResolver(apiUpdateSchema),
		defaultValues: {
			name: apikey.name,
			description: apikey.description,
			permissions: apikey.permissions,
		},
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		reset({
			name: apikey.name,
			description: apikey.description,
			permissions: apikey.permissions,
		});
	}, [apikey, open, reset]);

	const onSubmit = (data: ApiUpdateFormData) => {
		onOpenChange(false);

		apiKeyUpdateMutation.mutate(
			{
				apikeyId: apikey.id,
				name: data.name,
				description: data.description,
				permissions: data.permissions,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("requestDone"));
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{tApiKeys("editDialog.title")}</DialogTitle>
					<DialogDescription>
						{tApiKeys("editDialog.description")}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label>{tApiKeys("editDialog.form.nameLabel")}</Label>
							<Input
								id="name"
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
							<Label>{tApiKeys("editDialog.form.descriptionLabel")}</Label>
							<Textarea
								id="description"
								placeholder={tApiKeys("editDialog.form.descriptionPlaceholder")}
								aria-invalid={!!errors.description}
								{...register("description")}
							/>
						</div>

						<div className="grid gap-3">
							<Label>{tApiKeys("table.header.permissions")}</Label>
							<Controller
								name="permissions"
								control={control}
								render={({ field }) => (
									<div className="space-y-2">
										{apiPermissions?.results?.map(
											(permission: ApiPermission) => {
												const isChecked =
													field.value?.includes(permission.id) ?? false;

												return (
													<div
														key={permission.id}
														className="flex items-center gap-2"
													>
														<Checkbox
															id={permission.id}
															checked={isChecked}
															onCheckedChange={(checked) => {
																if (checked) {
																	field.onChange([
																		...(field.value ?? []),
																		permission.id,
																	]);
																	return;
																}

																field.onChange(
																	(field.value ?? []).filter(
																		(value) => value !== permission.id
																	)
																);
															}}
														/>
														<Label htmlFor={permission.id}>
															{permission.name}
														</Label>
													</div>
												);
											}
										)}
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
						<Button type="submit">{tCommon("action.save")}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default APIKeyUpdateDialog;
