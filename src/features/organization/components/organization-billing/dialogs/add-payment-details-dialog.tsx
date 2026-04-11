import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useTranslation } from "react-i18next";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import { useCreateBillingSource } from "@/features/organization/hooks/organization-billing/use-create-billing-source";
import { toast } from "sonner";

const createAddPaymentDetailsSchema = (messages: {
	nameRequired: string;
	emailInvalid: string;
	phoneRequired: string;
	addressLine1Required: string;
	cityRequired: string;
	stateRequired: string;
	postalCodeRequired: string;
	countryRequired: string;
}) =>
	z.object({
		name: z.string().min(1, messages.nameRequired),
		email: z.email(messages.emailInvalid),
		phone: z.string().min(1, messages.phoneRequired),
		address: z.object({
			line1: z.string().min(1, messages.addressLine1Required),
			line2: z.string(),
			city: z.string().min(1, messages.cityRequired),
			state: z.string().min(1, messages.stateRequired),
			postal_code: z.string().min(1, messages.postalCodeRequired),
			country: z.string().min(1, messages.countryRequired),
		}),
		provider: z.enum(["stripe"]),
	});

type AddPaymentDetailsFormData = z.infer<typeof addPaymentDetailsSchema>;

type AddPaymentDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const AddPaymentDetailsDialog = ({
	open,
	onOpenChange,
}: AddPaymentDetailsDialogProps) => {
	const { t } = useTranslation("billing" as any);
	const { t: tCommon } = useTranslation("common");
	const validationMessages = {
		nameRequired: t("validation.name.required"),
		emailInvalid: t("validation.email.invalid"),
		phoneRequired: t("validation.phone.required"),
		addressLine1Required: t("validation.address.line1.required"),
		cityRequired: t("validation.address.city.required"),
		stateRequired: t("validation.address.state.required"),
		postalCodeRequired: t("validation.address.postalCode.required"),
		countryRequired: t("validation.address.country.required"),
	};
	const addPaymentDetailsSchema =
		createAddPaymentDetailsSchema(validationMessages);

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<AddPaymentDetailsFormData>({
		resolver: zodResolver(addPaymentDetailsSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			address: {
				line1: "",
				line2: "",
				city: "",
				state: "",
				postal_code: "",
				country: "",
			},
			provider: "stripe",
		},
	});

	const createBillingSourceMutation = useCreateBillingSource();

	const onSubmit = (data: AddPaymentDetailsFormData) => {
		createBillingSourceMutation.mutate(data, {
			onSuccess: () => {
				onOpenChange(false);
				toast.success(tCommon("requestDone"));
				reset();
			},
		});
	};

	const onCancel = () => {
		onOpenChange(false);
		reset();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("dialogs.addPaymentDetails.title")}</DialogTitle>
					<DialogDescription>
						{t("dialogs.addPaymentDetails.description")}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="name">{t("common.name")}</Label>
							<Input
								id="name"
								{...register("name")}
								aria-invalid={!!errors.name}
							/>
							{errors.name && (
								<p className="text-destructive text-xs">
									{errors.name.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">{t("common.email")}</Label>
							<Input
								id="email"
								type="email"
								{...register("email")}
								aria-invalid={!!errors.email}
							/>
							{errors.email && (
								<p className="text-destructive text-xs">
									{errors.email.message}
								</p>
							)}
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="phone">{t("common.phone")}</Label>
							<Input
								id="phone"
								{...register("phone")}
								aria-invalid={!!errors.phone}
							/>
							{errors.phone && (
								<p className="text-destructive text-xs">
									{errors.phone.message}
								</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="provider">{t("common.provider")}</Label>
							<Controller
								name="provider"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="provider" className="w-full">
											<SelectValue
												placeholder={t(
													"dialogs.addPaymentDetails.providerPlaceholder"
												)}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="stripe">Stripe</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
							{errors.provider && (
								<p className="text-destructive text-xs">
									{errors.provider.message}
								</p>
							)}
						</div>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="line1">{t("common.addressLine1")}</Label>
							<Input
								id="line1"
								{...register("address.line1")}
								aria-invalid={!!errors.address?.line1}
							/>
							{errors.address?.line1 && (
								<p className="text-destructive text-xs">
									{errors.address.line1.message}
								</p>
							)}
						</div>

						<div className="grid gap-2 sm:col-span-2">
							<Label htmlFor="line2">{t("common.addressLine2")}</Label>
							<Input id="line2" {...register("address.line2")} />
						</div>

						<div className="grid gap-2">
							<Label htmlFor="city">{t("common.city")}</Label>
							<Input
								id="city"
								{...register("address.city")}
								aria-invalid={!!errors.address?.city}
							/>
							{errors.address?.city && (
								<p className="text-destructive text-xs">
									{errors.address.city.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="state">{t("common.state")}</Label>
							<Input
								id="state"
								{...register("address.state")}
								aria-invalid={!!errors.address?.state}
							/>
							{errors.address?.state && (
								<p className="text-destructive text-xs">
									{errors.address.state.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="postal_code">{t("common.postalCode")}</Label>
							<Input
								id="postal_code"
								{...register("address.postal_code")}
								aria-invalid={!!errors.address?.postal_code}
							/>
							{errors.address?.postal_code && (
								<p className="text-destructive text-xs">
									{errors.address.postal_code.message}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="country">{t("common.country")}</Label>
							<Input
								id="country"
								{...register("address.country")}
								aria-invalid={!!errors.address?.country}
							/>
							{errors.address?.country && (
								<p className="text-destructive text-xs">
									{errors.address.country.message}
								</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" onClick={onCancel}>
								{tCommon("action.cancel")}
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={createBillingSourceMutation.isPending}
						>
							{t("dialogs.addPaymentDetails.actions.submit")}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddPaymentDetailsDialog;
