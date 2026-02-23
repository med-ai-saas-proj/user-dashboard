import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import DashboardLayout from "@/layouts/dashboard-layout";

interface PlanFeature {
	text: string;
	free: boolean;
	pro: boolean;
	enterprise: boolean;
}

const FEATURES: PlanFeature[] = [
	{ text: "API calls", free: true, pro: true, enterprise: true },
	{ text: "gpt-4o-mini model", free: true, pro: true, enterprise: true },
	{ text: "gpt-4o model", free: false, pro: true, enterprise: true },
	{ text: "Knowledge bases", free: true, pro: true, enterprise: true },
	{ text: "Custom model selection", free: false, pro: true, enterprise: true },
	{ text: "Priority support", free: false, pro: true, enterprise: true },
	{
		text: "Dedicated infrastructure",
		free: false,
		pro: false,
		enterprise: true,
	},
	{ text: "SLA guarantee", free: false, pro: false, enterprise: true },
	{ text: "SSO / SAML", free: false, pro: false, enterprise: true },
	{ text: "Audit logs", free: false, pro: false, enterprise: true },
];

function FeatureCheck({ included }: { included: boolean }) {
	return included ? (
		<CheckIcon className="size-4 text-primary" aria-hidden="true" />
	) : (
		<XIcon className="size-4 text-muted-foreground/40" aria-hidden="true" />
	);
}

const PLANS = [
	{
		key: "free",
		price: "$0",
		limits: ["100 API calls / day", "5 knowledge bases", "Basic support"],
		highlighted: false,
	},
	{
		key: "pro",
		price: "$29",
		limits: [
			"Unlimited API calls",
			"Unlimited knowledge bases",
			"Priority support",
		],
		highlighted: true,
	},
	{
		key: "enterprise",
		price: null,
		limits: [
			"Everything in Pro",
			"Dedicated infrastructure",
			"SLA, SSO, audit logs",
		],
		highlighted: false,
	},
] as const;

export default function UpgradePage() {
	const { t } = useTranslation("upgrade");

	return (
		<DashboardLayout pageTitle={t("pageTitle")}>
			<div className="mx-auto w-full max-w-5xl space-y-12 pb-12">
				{/* Header */}
				<div className="text-center space-y-2 pt-4">
					<h1 className="text-3xl font-bold tracking-tight">
						{t("hero.title")}
					</h1>
					<p className="text-muted-foreground max-w-lg mx-auto">
						{t("hero.subtitle")}
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid gap-6 md:grid-cols-3">
					{PLANS.map((plan) => (
						<div
							key={plan.key}
							className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
								plan.highlighted
									? "border-2 border-primary shadow-lg shadow-primary/10"
									: "border-border shadow-sm"
							}`}
						>
							{plan.highlighted && (
								<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
									{t("plans.pro.popular")}
								</div>
							)}

							<div className="space-y-1 mb-4">
								<h3 className="text-lg font-semibold">
									{t(`plans.${plan.key}.name`)}
								</h3>
								<p className="text-sm text-muted-foreground">
									{t(`plans.${plan.key}.tagline`)}
								</p>
							</div>

							<div className="mb-6">
								{plan.price ? (
									<>
										<span className="text-4xl font-bold">{plan.price}</span>
										<span className="text-sm text-muted-foreground">
											{" "}
											/ {t("plans.month")}
										</span>
									</>
								) : (
									<span className="text-2xl font-bold">
										{t("plans.enterprise.contactPrice")}
									</span>
								)}
							</div>

							<ul className="space-y-2 mb-8 flex-1">
								{plan.limits.map((limit) => (
									<li key={limit} className="flex items-start gap-2 text-sm">
										<CheckIcon
											className={`mt-0.5 size-4 shrink-0 ${
												plan.highlighted
													? "text-primary"
													: "text-muted-foreground"
											}`}
											aria-hidden="true"
										/>
										{limit}
									</li>
								))}
							</ul>

							{plan.key === "free" && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									disabled
								>
									{t("plans.free.cta")}
								</Button>
							)}
							{plan.key === "pro" && (
								<Button
									type="button"
									className="w-full"
									onClick={() => toast.success(t("plans.pro.toast"))}
								>
									{t("plans.pro.cta")}
								</Button>
							)}
							{plan.key === "enterprise" && (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={() => toast.info(t("plans.enterprise.toast"))}
								>
									{t("plans.enterprise.cta")}
								</Button>
							)}
						</div>
					))}
				</div>

				{/* Feature Comparison Table */}
				<section className="space-y-4">
					<h2 className="text-xl font-semibold text-center">
						{t("comparison.title")}
					</h2>
					<div className="overflow-x-auto rounded-lg border">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b bg-muted/50">
									<th className="px-4 py-3 text-left font-medium">
										{t("comparison.feature")}
									</th>
									<th className="px-4 py-3 text-center font-medium">
										{t("plans.free.name")}
									</th>
									<th className="px-4 py-3 text-center font-medium text-primary">
										{t("plans.pro.name")}
									</th>
									<th className="px-4 py-3 text-center font-medium">
										{t("plans.enterprise.name")}
									</th>
								</tr>
							</thead>
							<tbody>
								{FEATURES.map((feat, i) => (
									<tr
										key={feat.text}
										className={i < FEATURES.length - 1 ? "border-b" : ""}
									>
										<td className="px-4 py-3">{feat.text}</td>
										<td className="px-4 py-3 text-center">
											<span className="inline-flex justify-center">
												<FeatureCheck included={feat.free} />
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											<span className="inline-flex justify-center">
												<FeatureCheck included={feat.pro} />
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											<span className="inline-flex justify-center">
												<FeatureCheck included={feat.enterprise} />
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</DashboardLayout>
	);
}
