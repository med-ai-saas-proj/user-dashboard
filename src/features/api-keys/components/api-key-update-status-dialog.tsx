import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";

type ApiKeyUpdateStatusDialogProps = {
	open: boolean;
	isDisabled: boolean;
	isSubmitting?: boolean;
	onOpenChange: (open: boolean) => void;
	onAgree: () => void;
};

const ApiKeyUpdateStatusDialog = ({
	open,
	isDisabled,
	isSubmitting = false,
	onOpenChange,
	onAgree,
}: ApiKeyUpdateStatusDialogProps) => {
	const { t: tApiKeys } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");

	const statusKey = isDisabled ? "enable" : "disable";

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
					<Button onClick={onAgree} disabled={isSubmitting}>
						{tApiKeys("statusDialog.agree")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ApiKeyUpdateStatusDialog;
