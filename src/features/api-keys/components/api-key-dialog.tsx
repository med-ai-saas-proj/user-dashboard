import { Button } from "@/components/shadcn/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { APIKeySaveDialog } from "./api-key-save-dialog";

const apiCreationSchema = z.object({
	name: z.string().min(1, "Name must be at least 1 character long"),
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

	const setSelectedApiKey = useServiceApiKeyStore(
		(state) => state.setSelectedApiKey
	);
	const createApiKeyMutation = useCreateApiKey();

	const [openSave, setOpenSave] = useState(false);
	const [createdKey, setCreatedKey] = useState<string>("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ApiCreationFormData>({
		resolver: zodResolver(apiCreationSchema),
	});

	const onSubmit = async (data: ApiCreationFormData) => {
		try {
			const response = await createApiKeyMutation.mutateAsync({
				name: data.name,
				description: "",
				project_id: "default",
				permissions: ["placeholder"],
			});

			setSelectedApiKey(response.key);
			setCreatedKey(response.key);

			setOpenSave(true);
			onOpenChange(false);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to create API key";
			toast.error(message);
		}
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
								<div className="h-5 mt-1.5 px-4">
									{errors.name && (
										<p className="text-destructive text-xs">
											{errors.name.message}
										</p>
									)}
								</div>
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
