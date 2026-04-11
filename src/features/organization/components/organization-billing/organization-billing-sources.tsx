import {
	Building2,
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

const OrganizationBillingSources = () => {
	const { t, i18n } = useTranslation("billing" as any);
	const { data: billingSource, isLoading, isError } = useGetBillingSource();
	const setBillingSourceId = useBillingStore(
		(state) => state.setBillingSourceId
	);

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

	if (source) {
		setBillingSourceId(source.billing_source_uid);
	}

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
			<div className="border rounded-lg p-6 bg-card">
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
		</div>
	);
};

export default OrganizationBillingSources;
