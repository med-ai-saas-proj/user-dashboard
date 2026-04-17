import { TriangleAlert } from "lucide-react";
import { useGetSetupIntents } from "../../hooks/organization-billing/use-get-setup-intents";
import { useTranslation } from "react-i18next";

const OrganizationBillingIntentActions = () => {
	const { t } = useTranslation("billing" as any);
	useGetSetupIntents();

	return (
		<div className="w-full py-10">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center gap-4 border border-alert rounded-lg p-4">
					<TriangleAlert size={20} className="text-alert" />
					<p className="font-semibold text-alert text-sm">
						{t("intentActions.noPending")}
					</p>
				</div>
			</div>
		</div>
	);
};

export default OrganizationBillingIntentActions;
