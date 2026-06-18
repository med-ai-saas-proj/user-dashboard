import { useQueryClient } from "@tanstack/react-query";
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
import { useUpdateDefaultPaymentMethod } from "@/features/organization/hooks/organization-billing/use-update-default-payment-method";

type SetDefaultBillingMethodDialogProps = {
	open: boolean;
	paymentMethodId: string | null;
	onOpenChange: (open: boolean) => void;
	setDefaultPaymentMethodId: (id: string | null) => void;
};

const SetDefaultBillingMethodDialog = ({
	open,
	paymentMethodId,
	onOpenChange,
	setDefaultPaymentMethodId,
}: SetDefaultBillingMethodDialogProps) => {
	const { t } = useTranslation("billing");
	const { t: tCommon } = useTranslation("common");
	const queryClient = useQueryClient();

	const setDefaultPaymentMethodMutation = useUpdateDefaultPaymentMethod();

	const onSetDefaultPaymentMethod = () => {
		if (!paymentMethodId) {
			return;
		}

		setDefaultPaymentMethodMutation.mutate(paymentMethodId, {
			onSuccess: () => {
				toast.success(tCommon("requestDone"));
				queryClient.invalidateQueries({
					queryKey: ["payment-methods"],
				});
				onOpenChange(false);
				setDefaultPaymentMethodId(paymentMethodId);
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
						{t("dialogs.setDefaultPaymentMethod.title")}
					</DialogTitle>
					<DialogDescription>
						{t("dialogs.setDefaultPaymentMethod.description")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={setDefaultPaymentMethodMutation.isPending}
					>
						{tCommon("action.cancel")}
					</Button>
					<Button
						variant="default"
						onClick={onSetDefaultPaymentMethod}
						disabled={setDefaultPaymentMethodMutation.isPending}
					>
						{t("dialogs.setDefaultPaymentMethod.actions.setDefault")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default SetDefaultBillingMethodDialog;
