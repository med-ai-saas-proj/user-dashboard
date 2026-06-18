import {
	CalendarDays,
	CreditCard,
	MapPin,
	Mail,
	Phone,
	TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/shadcn/card";
import { useGetPaymentMethods } from "../../hooks/organization-billing/use-get-payment-methods";
import OrganizationBillingIntentActions from "./organization-billing-intent-actions";
import DeleteBillingMethodDialog from "./dialogs/delete-billing-method-dialog";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import { Button } from "@/components/shadcn/button";
import SetDefaultBillingMethodDialog from "./dialogs/set-default-payment-method";
import { useBillingStore } from "../../store/billing";
import { cn } from "@/lib/utils";

const OrganizationBillingPaymentMethods = () => {
	const { t, i18n } = useTranslation("billing");

	const defaultPaymentMethodId = useBillingStore(
		(state) => state.defaultPaymentMethodId
	);
	const setDefaultPaymentMethodId = useBillingStore(
		(state) => state.setDefaultPaymentMethodId
	);

	const { data: paymentMethods, isLoading } = useGetPaymentMethods();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSetDefaultDialogOpen, setIsSetDefaultDialogOpen] = useState(false);
	const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
		string | null
	>(null);

	const hasPaymentMethods = (paymentMethods?.length ?? 0) > 0;

	const openDeleteDialog = (paymentMethodId: string) => {
		setSelectedPaymentMethodId(paymentMethodId);
		setIsDeleteDialogOpen(true);
	};

	const openSetDefaultDialog = (paymentMethodId: string) => {
		setSelectedPaymentMethodId(paymentMethodId);
		setIsSetDefaultDialogOpen(true);
	};

	const orderedPaymentMethods = useMemo(() => {
		if (!paymentMethods || paymentMethods.length === 0) return [];

		const methodsCopy = [...paymentMethods];

		const index = methodsCopy.findIndex((m) => m.id === defaultPaymentMethodId);

		if (index > 0) {
			const [defaultItem] = methodsCopy.splice(index, 1);
			methodsCopy.unshift(defaultItem);
		}

		return methodsCopy;
	}, [paymentMethods, defaultPaymentMethodId]);

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={itemVariants}
			className="w-full py-10"
		>
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<p className="text-2xl font-semibold">
							{t("paymentMethods.title")}
						</p>
						<p className="text-sm text-muted-foreground">
							{t("paymentMethods.description")}
						</p>
					</div>

					{isLoading ? (
						<Card className="border-dashed">
							<CardHeader>
								<CardTitle>
									<div className="h-5 w-40 animate-pulse rounded bg-muted" />
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid gap-3">
									<div className="h-4 w-full animate-pulse rounded bg-muted" />
									<div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
									<div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
								</div>
							</CardContent>
						</Card>
					) : hasPaymentMethods ? (
						<div className="flex flex-col items-center gap-y-8">
							{orderedPaymentMethods.map((paymentMethod) => {
								const billingAddress = [
									paymentMethod.billing_details.address.line1,
									paymentMethod.billing_details.address.line2,
									paymentMethod.billing_details.address.city,
									paymentMethod.billing_details.address.state,
									paymentMethod.billing_details.address.postal_code,
									paymentMethod.billing_details.address.country,
								]
									.filter(Boolean)
									.join(", ");

								const createdAt = new Date(
									paymentMethod.created * 1000
								).toLocaleDateString(i18n.language);

								const isDefault = paymentMethod.id === defaultPaymentMethodId;

								return (
									<Card key={paymentMethod.id} className="w-full py-0">
										<CardHeader className="border-b bg-muted/20 pt-6">
											<CardTitle>
												<div className="flex items-start justify-between gap-4">
													<div className="flex items-center gap-3">
														<div className="rounded-md border bg-background p-3">
															<CreditCard size={18} />
														</div>
														<div>
															<p className="text-base font-semibold capitalize">
																{paymentMethod.card.brand} ending in{" "}
																{paymentMethod.card.last4}
															</p>
															<p className="text-sm text-muted-foreground">
																{paymentMethod.type.toUpperCase()}{" "}
																{t("common.method")}
															</p>
														</div>
													</div>
													<div className="flex flex-col items-end">
														<p className="text-sm text-muted-foreground">
															ID: {paymentMethod.id}
														</p>
														<p className="text-sm text-muted-foreground">
															{t("paymentMethods.added")}: {createdAt}
														</p>
													</div>
												</div>
											</CardTitle>
										</CardHeader>
										<CardContent className={cn(isDefault ? "pb-6" : "pb-3")}>
											<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
												<div className="flex items-start gap-3">
													<Mail
														size={16}
														className="mt-0.5 text-muted-foreground"
													/>
													<div>
														<p className="text-sm text-muted-foreground">
															{t("common.email")}
														</p>
														<p className="font-medium">
															{paymentMethod.billing_details.email ??
																t("common.notProvided")}
														</p>
													</div>
												</div>

												<div className="flex items-start gap-3">
													<Phone
														size={16}
														className="mt-0.5 text-muted-foreground"
													/>
													<div>
														<p className="text-sm text-muted-foreground">
															{t("common.phone")}
														</p>
														<p className="font-medium">
															{paymentMethod.billing_details.phone ??
																t("common.notProvided")}
														</p>
													</div>
												</div>

												<div className="flex items-start gap-3">
													<MapPin
														size={16}
														className="mt-0.5 text-muted-foreground"
													/>
													<div>
														<p className="text-sm text-muted-foreground">
															{t("common.billingAddress")}
														</p>
														<p className="font-medium">
															{billingAddress || t("common.notProvided")}
														</p>
													</div>
												</div>

												<div className="flex items-start gap-3">
													<CalendarDays
														size={16}
														className="mt-0.5 text-muted-foreground"
													/>
													<div>
														<p className="text-sm text-muted-foreground">
															{t("paymentMethods.cardDetails")}
														</p>
														<p className="font-medium capitalize text-nowrap">
															{paymentMethod.card.brand} •{" "}
															{paymentMethod.card.funding} • Exp{" "}
															{paymentMethod.card.exp_month}/
															{paymentMethod.card.exp_year}
														</p>
													</div>
												</div>
											</div>
										</CardContent>
										{!isDefault && (
											<CardFooter className="flex items-center justify-end gap-2 pb-6">
												<Button
													size="sm"
													className="text-sm bg-destructive hover:bg-destructive/80"
													onClick={() => openDeleteDialog(paymentMethod.id)}
												>
													{t("paymentMethods.actions.delete")}
												</Button>
												<Button
													size="sm"
													variant="default"
													className="text-sm"
													onClick={() => openSetDefaultDialog(paymentMethod.id)}
												>
													{t("paymentMethods.actions.setDefault")}
												</Button>
											</CardFooter>
										)}
										{isDefault && (
											<CardFooter className="flex items-center justify-end gap-2 pb-6">
												<p className="text-sm text-successful font-medium px-4 py-1 rounded-md border border-successful-status bg-successful-status/25">
													{t("paymentMethods.actions.default")}
												</p>
											</CardFooter>
										)}
									</Card>
								);
							})}
						</div>
					) : (
						<div className="flex items-center gap-4 border border-alert rounded-lg p-4">
							<TriangleAlert size={20} className="text-alert" />
							<div className="flex flex-col gap-1 text-alert">
								<p className="font-semibold text-sm">
									{t("paymentMethods.empty.title")}
								</p>
								<p className="font-normal text-sm">
									{t("paymentMethods.empty.description")}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
			<OrganizationBillingIntentActions />
			<DeleteBillingMethodDialog
				open={isDeleteDialogOpen}
				paymentMethodId={selectedPaymentMethodId}
				onOpenChange={(open) => {
					setIsDeleteDialogOpen(open);
					if (!open) {
						setSelectedPaymentMethodId(null);
					}
				}}
			/>
			<SetDefaultBillingMethodDialog
				open={isSetDefaultDialogOpen}
				paymentMethodId={selectedPaymentMethodId}
				onOpenChange={(open) => {
					setIsSetDefaultDialogOpen(open);
					if (!open) {
						setSelectedPaymentMethodId(null);
					}
				}}
				setDefaultPaymentMethodId={setDefaultPaymentMethodId}
			/>
		</motion.div>
	);
};

export default OrganizationBillingPaymentMethods;
