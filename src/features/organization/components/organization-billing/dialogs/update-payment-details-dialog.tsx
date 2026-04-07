import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/shadcn/label";
import { Skeleton } from "@/components/shadcn/skeleton";
import { useGetBillingSource } from "@/features/organization/hooks/organization-billing/use-get-billing-source";
import { useUpdateBillingSource } from "@/features/organization/hooks/organization-billing/use-update-billing-source";

const updatePaymentDetailsSchema = z.object({
	new_address: z.object({
		line1: z.string().min(1, "Address line 1 is required"),
		line2: z.string(),
		city: z.string().min(1, "City is required"),
		state: z.string().min(1, "State is required"),
		postal_code: z.string().min(1, "Postal code is required"),
		country: z.string().min(1, "Country is required"),
	}),
	new_email: z.email("Invalid email address"),
	new_phone: z.string().min(1, "Phone is required"),
});

type UpdatePaymentDetailsFormData = z.infer<typeof updatePaymentDetailsSchema>;

type UpdatePaymentDetailsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const UpdatePaymentDetailsDialog = ({
	open,
	onOpenChange,
}: UpdatePaymentDetailsDialogProps) => {
	const { data: billingSource, isLoading } = useGetBillingSource();
	const updateBillingSourceMutation = useUpdateBillingSource();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<UpdatePaymentDetailsFormData>({
		resolver: zodResolver(updatePaymentDetailsSchema),
		defaultValues: {
			new_address: {
				line1: "",
				line2: "",
				city: "",
				state: "",
				postal_code: "",
				country: "",
			},
			new_email: "",
			new_phone: "",
		},
	});

	useEffect(() => {
		if (!open || !billingSource?.data) {
			return;
		}

		const source = billingSource.data;

		reset({
			new_address: {
				line1: source.billing_address.line1,
				line2: source.billing_address.line2,
				city: source.billing_address.city,
				state: source.billing_address.state,
				postal_code: source.billing_address.postal_code,
				country: source.billing_address.country,
			},
			new_email: source.email,
			new_phone: source.phone,
		});
	}, [billingSource, open, reset]);

	const onSubmit = (data: UpdatePaymentDetailsFormData) => {
		updateBillingSourceMutation.mutate(data, {
			onSuccess: () => {
				onOpenChange(false);
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
					<DialogTitle>Update Payment Details</DialogTitle>
					<DialogDescription>
						Update the billing contact details currently associated with your
						organization.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="grid gap-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="grid gap-2">
								<Label htmlFor="new_email">Email</Label>
								<Input
									id="new_email"
									type="email"
									{...register("new_email")}
									aria-invalid={!!errors.new_email}
								/>
								{errors.new_email && (
									<p className="text-destructive text-xs">
										{errors.new_email.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="new_phone">Phone</Label>
								<Input
									id="new_phone"
									{...register("new_phone")}
									aria-invalid={!!errors.new_phone}
								/>
								{errors.new_phone && (
									<p className="text-destructive text-xs">
										{errors.new_phone.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="grid gap-2 sm:col-span-2">
								<Label htmlFor="new_address.line1">Address line 1</Label>
								<Input
									id="new_address.line1"
									{...register("new_address.line1")}
									aria-invalid={!!errors.new_address?.line1}
								/>
								{errors.new_address?.line1 && (
									<p className="text-destructive text-xs">
										{errors.new_address.line1.message}
									</p>
								)}
							</div>

							<div className="grid gap-2 sm:col-span-2">
								<Label htmlFor="new_address.line2">Address line 2</Label>
								<Input
									id="new_address.line2"
									{...register("new_address.line2")}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="new_address.city">City</Label>
								<Input
									id="new_address.city"
									{...register("new_address.city")}
									aria-invalid={!!errors.new_address?.city}
								/>
								{errors.new_address?.city && (
									<p className="text-destructive text-xs">
										{errors.new_address.city.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="new_address.state">State</Label>
								<Input
									id="new_address.state"
									{...register("new_address.state")}
									aria-invalid={!!errors.new_address?.state}
								/>
								{errors.new_address?.state && (
									<p className="text-destructive text-xs">
										{errors.new_address.state.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="new_address.postal_code">Postal code</Label>
								<Input
									id="new_address.postal_code"
									{...register("new_address.postal_code")}
									aria-invalid={!!errors.new_address?.postal_code}
								/>
								{errors.new_address?.postal_code && (
									<p className="text-destructive text-xs">
										{errors.new_address.postal_code.message}
									</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="new_address.country">Country</Label>
								<Input
									id="new_address.country"
									{...register("new_address.country")}
									aria-invalid={!!errors.new_address?.country}
								/>
								{errors.new_address?.country && (
									<p className="text-destructive text-xs">
										{errors.new_address.country.message}
									</p>
								)}
							</div>
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={updateBillingSourceMutation.isPending}
							>
								Save changes
							</Button>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default UpdatePaymentDetailsDialog;
