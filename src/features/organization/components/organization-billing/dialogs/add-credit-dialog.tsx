import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Dialog,
	DialogHeader,
	DialogTrigger,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/shadcn/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/shadcn/field";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { toScaledAmount } from "@/features/organization/utils/billing-amount-calculation";
import { useAddCredit } from "@/features/organization/hooks/organization-billing/use-add-credit";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const AmountSchema = z.number().min(0, "Value must be a positive number");

const AddCreditSchema = z.object({
	description: z
		.string()
		.max(255, "Description must be at most 255 characters")
		.optional(),
});

type AddCreditFormData = z.infer<typeof AddCreditSchema>;
type AddCreditDialogProps = {
	triggerElement: React.ReactNode;
};

const AddCreditDialog = ({ triggerElement }: AddCreditDialogProps) => {
	const { t: tCommon } = useTranslation("common");
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<AddCreditFormData>({
		resolver: zodResolver(AddCreditSchema),
		defaultValues: {
			description: "",
		},
	});

	const { mutate: addCredit } = useAddCredit();
	const [openDialog, setOpenDialog] = useState(false);
	const [amountInput, setAmountInput] = useState("");

	const parsedAmount = useMemo(() => Number(amountInput), [amountInput]);
	const amountValidation = useMemo(
		() => AmountSchema.safeParse(parsedAmount),
		[parsedAmount]
	);
	const scaledAmount = useMemo(
		() => toScaledAmount(amountInput),
		[amountInput]
	);

	const onSubmit = (data: AddCreditFormData) => {
		if (!amountValidation.success) {
			return;
		}

		addCredit(
			{
				amount: scaledAmount,
				description: data.description ?? "",
			},
			{
				onSuccess: () => {
					toast(tCommon("requestDone"));
					setOpenDialog(false);
				},
				onError: () => {
					toast(tCommon("error"));
				},
			}
		);
	};

	return (
		<Dialog open={openDialog} onOpenChange={setOpenDialog}>
			<DialogTrigger asChild>{triggerElement}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Credit</DialogTitle>
					<DialogDescription>
						Enter the amount of credit to add and a description.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field>
							<FieldLabel>Amount (USD)</FieldLabel>
							<Input
								type="text"
								inputMode="decimal"
								placeholder="0.00"
								value={amountInput}
								onChange={(event) => setAmountInput(event.target.value)}
							/>
							<FieldError
								errors={
									!amountValidation.success
										? [
												{
													message: amountValidation.error.issues[0]?.message,
												},
											]
										: undefined
								}
							/>
						</Field>
						<Field>
							<FieldLabel>Description</FieldLabel>
							<Input {...register("description")} />
							<FieldError errors={[errors.description]} />
						</Field>
						<Field>
							<FieldLabel>Scale</FieldLabel>
							<Input
								value={scaledAmount.scale}
								readOnly
								disabled
								aria-readonly="true"
							/>
						</Field>
						<Field>
							<FieldLabel>Final Scaled Value</FieldLabel>
							<Input
								value={scaledAmount.value}
								readOnly
								disabled
								aria-readonly="true"
							/>
						</Field>
					</FieldGroup>
					<Field orientation="horizontal" className="justify-end mt-6">
						<DialogFooter>
							<Button
								type="submit"
								className="bg-primary hover:bg-primary/80"
								disabled={!amountValidation.success}
							>
								Add Credit
							</Button>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
						</DialogFooter>
					</Field>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddCreditDialog;
