import "i18next";
import type commonEN from "../public//locales/en/common.json";
import type sidebarEN from "../public/locales/en/sidebar.json";
import type apiKeysEN from "../public/locales/en/api-keys.json";
import type signInEN from "../public/locales/en/sign-in.json";
import type playgroundAISearchEN from "../public/locales/en/playground-ai-search.json";
import type playgroundRxAdvisorEN from "../public/locales/en/playground-rx-advisor.json";
import type clinicalProgressEN from "../public/locales/en/clinical-progress.json";
import type labResultsEN from "../public/locales/en/lab-results.json";
import type medicationEN from "../public/locales/en/medication-section.json";
import type patientInfoEN from "../public/locales/en/patient-info.json";
import type summaryResponseEN from "../public/locales/en/summary-response.json";
import type chatbotEN from "../public/locales/en/chatbot.json";
import type dashboardEN from "../public/locales/en/dashboard.json";
import type settingEN from "../public.locales/en/settings.json";
import type organizationEN from "../public/locales/en/organization.json";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		resources: {
			common: typeof commonEN;
			sidebar: typeof sidebarEN;
			"api-keys": typeof apiKeysEN;
			"sign-in": typeof signInEN;
			"playground-ai-search": typeof playgroundAISearchEN;
			"playground-rx-advisor": typeof playgroundRxAdvisorEN;
			"clinical-progress": typeof clinicalProgressEN;
			"lab-results": typeof labResultsEN;
			medication: typeof medicationEN;
			"patient-info": typeof patientInfoEN;
			"summary-response": typeof summaryResponseEN;
			chatbot: typeof chatbotEN;
			dashboard: typeof dashboardEN;
			setting: typeof settingEN;
			organization: typeof organizationEN;
		};
	}
}
