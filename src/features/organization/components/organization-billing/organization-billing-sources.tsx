import { useEffect } from "react";
import {
	Building2,
	CalendarDays,
	CreditCard,
	Mail,
	MapPin,
	Phone,
	TriangleAlert,
} from "lucide-react";
import { Skeleton } from "@/components/shadcn/skeleton";
import { useGetBillingSource } from "../../hooks/organization-billing/use-get-billing-source";
import { useBillingStore } from "../../store/billing";
import { useTranslation } from "react-i18next";
import { useGetPaymentMethodInfo } from "../../hooks/organization-billing/use-get-payment-method-info";
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
} from "@/components/shadcn/card";

const OrganizationBillingSources = () => {
	const { t, i18n } = useTranslation("billing");

	const setBillingSourceId = useBillingStore(
		(state) => state.setBillingSourceId
	);
	const setDefaultPaymentMethodId = useBillingStore(
		(state) => state.setDefaultPaymentMethodId
	);
	const defaultPaymentMethodId = useBillingStore(
		(state) => state.defaultPaymentMethodId
	);

	const { data: billingSource, isLoading, isError } = useGetBillingSource();
	const { data: defaultPaymentMethod } = useGetPaymentMethodInfo(
		defaultPaymentMethodId
	);

	useEffect(() => {
		if (billingSource?.data) {
			setBillingSourceId(billingSource.data.billing_source_uid);
		}

		if (billingSource?.data?.default_payment_method) {
			setDefaultPaymentMethodId(billingSource.data.default_payment_method);
		} else {
			setDefaultPaymentMethodId(null);
		}
	}, [billingSource, setBillingSourceId, setDefaultPaymentMethodId]);

	if (isLoading) {
		return (
			<div className="w-full py-10">
				<div className="max-w-4xl mx-auto">
					<div className="border rounded-lg p-6 space-y-4">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-72" />
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-4 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="w-full py-10">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center gap-4 border border-alert rounded-lg p-4 text-alert">
						<TriangleAlert size={20} />
						<p className="text-sm font-medium">{t("sources.errorLoad")}</p>
					</div>
				</div>
			</div>
		);
	}

	const source = billingSource?.data;

	if (!source) {
		return (
			<div className="w-full py-10">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center gap-4 border border-alert rounded-lg p-4 text-alert">
						<TriangleAlert size={20} />
						<div className="flex flex-col gap-1">
							<p className="font-semibold text-sm">
								{t("sources.empty.title")}
							</p>
							<p className="text-sm">{t("sources.empty.description")}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const billingAddress = [
		source.billing_address.line1,
		source.billing_address.line2,
		source.billing_address.city,
		source.billing_address.state,
		source.billing_address.postal_code,
		source.billing_address.country,
	]
		.filter(Boolean)
		.join(", ");

	const createdAt = new Date(source.created_at).toLocaleDateString(
		i18n.language
	);

	return (
		<div className="w-full">
			<div className="border rounded-lg p-6 bg-card flex flex-col gap-y-10">
				<div>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-md border bg-background/70">
								<CreditCard size={18} />
							</div>
							<div>
								<p className="font-semibold text-md">{t("sources.title")}</p>
								<p className="text-sm text-muted-foreground">
									{t("sources.provider")}: {source.source_type}
								</p>
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							{t("sources.created")}: {createdAt}
						</p>
					</div>

					<div className="mt-6 grid gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3">
							<Building2 size={16} className="mt-0.5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									{t("common.name")}
								</p>
								<p className="font-medium">{source.name}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Mail size={16} className="mt-0.5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									{t("common.email")}
								</p>
								<p className="font-medium">{source.email}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Phone size={16} className="mt-0.5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									{t("common.phone")}
								</p>
								<p className="font-medium">{source.phone}</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<MapPin size={16} className="mt-0.5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">
									{t("common.billingAddress")}
								</p>
								<p className="font-medium">{billingAddress}</p>
							</div>
						</div>
					</div>
				</div>
				{defaultPaymentMethod && (
					<>
						<div className="h-px w-full bg-border" />
						<div className="px-4 py-2 rounded-md border-2 border-dashed bg-card-gradient w-fit">
							<p className="text-sm font-medium">
								{t("sources.paymentMethod.title")}
							</p>
						</div>
						<Card
							key={defaultPaymentMethod.id}
							className="w-full p-0 border-0 shadow-none"
						>
							<CardHeader className="p-0">
								<CardTitle>
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-center gap-3">
											<div className="rounded-md border bg-background p-3">
												<CreditCard size={18} />
											</div>
											<div>
												<p className="text-base font-semibold capitalize">
													{defaultPaymentMethod.type === "card"
														? `${defaultPaymentMethod.card.brand} ending in ${defaultPaymentMethod.card.last4}`
														: `${defaultPaymentMethod.us_bank_account.bank_name} ending in ${defaultPaymentMethod.us_bank_account.last4}`}
												</p>
												<p className="text-sm text-muted-foreground">
													{defaultPaymentMethod.type === "card"
														? "CARD"
														: "BANK ACCOUNT"}{" "}
													{t("common.method")}
												</p>
											</div>
										</div>
										<div className="flex flex-col items-end font-normal">
											<p className="text-sm text-muted-foreground">
												ID: {defaultPaymentMethod.id}
											</p>
											<p className="text-sm text-muted-foreground">
												{t("paymentMethods.added")}: {createdAt}
											</p>
										</div>
									</div>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<div className="grid grid-cols-2 gap-4">
									<div className="flex items-start gap-3">
										<Mail size={16} className="mt-0.5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												{t("common.email")}
											</p>
											<p className="font-medium">
												{defaultPaymentMethod.billing_details.email ??
													t("common.notProvided")}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Phone size={16} className="mt-0.5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">
												{t("common.phone")}
											</p>
											<p className="font-medium">
												{defaultPaymentMethod.billing_details.phone ??
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
												{defaultPaymentMethod.type === "card"
													? t("paymentMethods.cardDetails")
													: t("paymentMethods.bankDetails")}
											</p>
											{defaultPaymentMethod.type === "card" ? (
												<p className="font-medium capitalize text-nowrap">
													{defaultPaymentMethod.card.brand} •{" "}
													{defaultPaymentMethod.card.funding} • Exp{" "}
													{defaultPaymentMethod.card.exp_month}/
													{defaultPaymentMethod.card.exp_year}
												</p>
											) : (
												<p className="font-medium capitalize text-nowrap">
													{defaultPaymentMethod.us_bank_account.bank_name} •{" "}
													{defaultPaymentMethod.us_bank_account.account_type} •
													Routing{" "}
													{defaultPaymentMethod.us_bank_account.routing_number}
												</p>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
};

export default OrganizationBillingSources;
