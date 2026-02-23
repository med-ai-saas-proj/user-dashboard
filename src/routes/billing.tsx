import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
	CheckIcon,
	CreditCardIcon,
	FileTextIcon,
	SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Separator } from "@/components/shadcn/separator";
import DashboardLayout from "@/layouts/dashboard-layout";

const PLAN_FEATURES = {
	free: [
		"100 API calls / day",
		"gpt-4o-mini model",
		"5 knowledge bases",
		"Basic support",
	],
	pro: [
		"Unlimited API calls",
		"gpt-4o model",
		"Unlimited knowledge bases",
		"Priority support",
		"Custom model selection",
	],
};

export default function BillingPage() {
	const { t } = useTranslation("billing");
	const navigate = useNavigate();

	return (
		<DashboardLayout pageTitle={t("pageTitle")}>
			<div className="mx-auto w-full max-w-4xl space-y-10 pb-12">
				{/* Current Plan */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold">{t("currentPlan.title")}</h2>
					<div className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<div className="flex items-center gap-2">
								<span className="text-xl font-bold">
									{t("currentPlan.free")}
								</span>
								<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
									{t("currentPlan.active")}
								</span>
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								{t("currentPlan.description")}
							</p>
						</div>
						<Button
							type="button"
							onClick={() => navigate("/upgrade")}
							className="shrink-0"
						>
							<SparklesIcon className="size-4" aria-hidden="true" />
							{t("currentPlan.upgrade")}
						</Button>
					</div>
				</section>

				{/* Plan Comparison */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold">{t("comparison.title")}</h2>
					<div className="grid gap-6 md:grid-cols-2">
						{/* Free tier */}
						<div className="rounded-lg border p-6 space-y-4">
							<div>
								<h3 className="text-base font-semibold">
									{t("plans.free.name")}
								</h3>
								<div className="mt-1">
									<span className="text-3xl font-bold">$0</span>
									<span className="text-sm text-muted-foreground">
										{" "}
										/ {t("plans.month")}
									</span>
								</div>
							</div>
							<Separator />
							<ul className="space-y-2">
								{PLAN_FEATURES.free.map((feat) => (
									<li key={feat} className="flex items-start gap-2 text-sm">
										<CheckIcon
											className="mt-0.5 size-4 shrink-0 text-muted-foreground"
											aria-hidden="true"
										/>
										{feat}
									</li>
								))}
							</ul>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								disabled
							>
								{t("plans.free.current")}
							</Button>
						</div>

						{/* Pro tier */}
						<div className="relative rounded-lg border-2 border-primary p-6 space-y-4 shadow-md">
							<div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
								{t("plans.pro.popular")}
							</div>
							<div>
								<h3 className="text-base font-semibold">
									{t("plans.pro.name")}
								</h3>
								<div className="mt-1">
									<span className="text-3xl font-bold">$29</span>
									<span className="text-sm text-muted-foreground">
										{" "}
										/ {t("plans.month")}
									</span>
								</div>
							</div>
							<Separator />
							<ul className="space-y-2">
								{PLAN_FEATURES.pro.map((feat) => (
									<li key={feat} className="flex items-start gap-2 text-sm">
										<CheckIcon
											className="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden="true"
										/>
										{feat}
									</li>
								))}
							</ul>
							<Button
								type="button"
								className="w-full"
								onClick={() => navigate("/upgrade")}
							>
								{t("plans.pro.upgrade")}
							</Button>
						</div>
					</div>
				</section>

				{/* Payment Method */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold">{t("payment.title")}</h2>
					<div className="rounded-lg border p-6">
						<p className="text-sm text-muted-foreground mb-4">
							{t("payment.description")}
						</p>
						<Button
							type="button"
							variant="outline"
							onClick={() => toast.info(t("payment.stripeToast"))}
						>
							<CreditCardIcon className="size-4" aria-hidden="true" />
							{t("payment.connectStripe")}
						</Button>
					</div>
				</section>

				{/* Invoice History */}
				<section className="space-y-4">
					<h2 className="text-lg font-semibold">{t("invoices.title")}</h2>
					<div className="rounded-lg border p-10 flex flex-col items-center justify-center text-center">
						<div className="rounded-full bg-muted p-3 mb-3">
							<FileTextIcon
								className="size-6 text-muted-foreground"
								aria-hidden="true"
							/>
						</div>
						<p className="text-sm font-medium">{t("invoices.empty")}</p>
						<p className="text-xs text-muted-foreground mt-1">
							{t("invoices.emptyDescription")}
						</p>
					</div>
				</section>
			</div>
		</DashboardLayout>
	);
}
