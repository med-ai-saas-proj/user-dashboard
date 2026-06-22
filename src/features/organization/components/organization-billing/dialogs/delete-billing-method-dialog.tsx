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
import { useDeletePaymentMethod } from "../../../hooks/organization-billing/use-delete-payment-method";
import { useBillingStore } from "@/features/organization/store/billing";

type DeleteBillingMethodDialogProps = {
	open: boolean;
	paymentMethodId: string | null;
	isDefaultPaymentMethod?: boolean;
	onOpenChange: (open: boolean) => void;
};

const DeleteBillingMethodDialog = ({
	open,
	isDefaultPaymentMethod,
	paymentMethodId,
	onOpenChange,
}: DeleteBillingMethodDialogProps) => {
	const { t } = useTranslation("billing");
	const { t: tCommon } = useTranslation("common");
	const queryClient = useQueryClient();

	const deletePaymentMethodMutation = useDeletePaymentMethod();

	const onDeletePaymentMethod = () => {
		if (!paymentMethodId) {
			return;
		}

		deletePaymentMethodMutation.mutate(paymentMethodId, {
			onSuccess: () => {
				toast.success(tCommon("requestDone"));
				queryClient.invalidateQueries({
					queryKey: ["payment-methods"],
				});
				onOpenChange(false);

				if (isDefaultPaymentMethod) {
					useBillingStore.getState().setDefaultPaymentMethodId(null);
				}
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
					<DialogTitle>{t("dialogs.deletePaymentMethod.title")}</DialogTitle>
					<DialogDescription>
						{t("dialogs.deletePaymentMethod.description")}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={deletePaymentMethodMutation.isPending}
					>
						{tCommon("action.cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={onDeletePaymentMethod}
						disabled={deletePaymentMethodMutation.isPending}
					>
						{t("dialogs.deletePaymentMethod.actions.delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteBillingMethodDialog;
