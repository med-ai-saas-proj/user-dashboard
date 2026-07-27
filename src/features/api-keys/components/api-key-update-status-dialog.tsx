import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { Spinner } from "@/components/shadcn/spinner";
import type { APIKey } from "../api-key.type";
import { useDisableApiKey } from "../hooks/use-disable-api-key";
import { useEnableApiKey } from "../hooks/use-enable-api-key";

type ApiKeyUpdateStatusDialogProps = {
	open: boolean;
	isDisabled: boolean;
	isSubmitting?: boolean;
	selectedApiKey: APIKey | null;
	onOpenChange: (open: boolean) => void;
};

const ApiKeyUpdateStatusDialog = ({
	open,
	isDisabled,
	selectedApiKey,
	onOpenChange,
}: ApiKeyUpdateStatusDialogProps) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const enableAPIKeyMutation = useEnableApiKey();
	const disableAPIKeyMutation = useDisableApiKey();

	const statusKey = isDisabled ? "enable" : "disable";
	const isSubmitting =
		enableAPIKeyMutation.isPending || disableAPIKeyMutation.isPending;

	const onAgreeUpdateApiKeyStatus = () => {
		if (!selectedApiKey) return;

		onOpenChange(false);

		if (selectedApiKey.disabled) {
			enableAPIKeyMutation.mutate(selectedApiKey.id, {
				onSuccess: () => {
					toast.success(tCommon("requestDone"));
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			});
			return;
		}

		disableAPIKeyMutation.mutate(selectedApiKey.id, {
			onSuccess: () => {
				toast.success(tCommon("requestDone"));
			},
			onError: () => {
				toast.error(tCommon("error"));
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{tApiKeys(`statusDialog.${statusKey}.title`)}
					</DialogTitle>
					<DialogDescription>
						{tApiKeys(`statusDialog.${statusKey}.description`)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						{tCommon("action.cancel")}
					</Button>
					<Button
						onClick={onAgreeUpdateApiKeyStatus}
						disabled={isSubmitting}
						className="flex items-center justify-center gap-2"
					>
						{isSubmitting && <Spinner />}
						{tApiKeys("statusDialog.agree")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ApiKeyUpdateStatusDialog;
