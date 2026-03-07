import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
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
import type { APIKey } from "@/features/api-keys/api-key.type";
import { useUpdateApiKey } from "@/features/api-keys/hooks/use-update-api-key";

const apiUpdateSchema = z.object({
	name: z.string().min(1, "Name must be at least 1 character long"),
});

type ApiUpdateFormData = z.infer<typeof apiUpdateSchema>;

const APIKeyUpdateDialog = ({
	apikeyId,
	open,
	onOpenChange,
}: {
	apikeyId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const apiKeyUpdateMutation = useUpdateApiKey();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ApiUpdateFormData>({
		resolver: zodResolver(apiUpdateSchema),
	});

	const onSubmit = (data: ApiUpdateFormData) => {
		onOpenChange(false);

		const name = data.name;

		const newKey: Pick<APIKey, "name" | "permissions"> = {
			name,
			permissions: ["read", "write"],
		};

		apiKeyUpdateMutation.mutate({ apikeyId, ...newKey });
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
						<Button type="submit">{tCommon("action.save")}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default APIKeyUpdateDialog;
