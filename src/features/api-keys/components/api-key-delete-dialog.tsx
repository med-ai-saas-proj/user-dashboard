import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import type { APIKey } from "@/features/api-keys/api-key.type";
import { useDeleteApiKey } from "@/features/api-keys/hooks/use-delete-api-key";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

type ApiKeyDeleteDialogProps = {
	open: boolean;
	selectedApiKey: APIKey | null;
	onOpenChange: (open: boolean) => void;
};

const ApiKeyDeleteDialog = ({
	open,
	selectedApiKey,
	onOpenChange,
}: ApiKeyDeleteDialogProps) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const deleteApiKeyMutation = useDeleteApiKey();

	const onDeleteApiKey = () => {
		if (!selectedApiKey) return;

		onOpenChange(false);
		deleteApiKeyMutation.mutate(selectedApiKey.id, {
			onSuccess: () => {
				toast.success(tCommon("requestDone"));
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{tApiKeys("deleteDialog.title")}</DialogTitle>
					<DialogDescription>
						{tApiKeys("deleteDialog.description")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{tCommon("action.cancel")}
					</Button>
					<Button variant="destructive" onClick={onDeleteApiKey}>
						{tApiKeys("table.actions.delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ApiKeyDeleteDialog;
