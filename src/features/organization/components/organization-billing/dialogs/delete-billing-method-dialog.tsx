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

type DeleteBillingMethodDialogProps = {
	open: boolean;
	paymentMethodId: string | null;
	onOpenChange: (open: boolean) => void;
};

const DeleteBillingMethodDialog = ({
	open,
	paymentMethodId,
	onOpenChange,
}: DeleteBillingMethodDialogProps) => {
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
					<DialogTitle>Delete payment method</DialogTitle>
					<DialogDescription>
						This action will remove this payment method from your billing
						account. Are you sure you want to continue?
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
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteBillingMethodDialog;
