import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const locales = [
	{ code: "en", label: "EN" },
	{ code: "vi", label: "VI" },
];

i18n
	// load translations from http -> /public/locales
	.use(HttpBackend)
	// detect user language
	.use(LanguageDetector)
	// pass the i18n instance to react-i18next.
	.use(initReactI18next)
	// init i18next
	.init({
		// fallback language is used when a translation is missing
		fallbackLng: "en",
		backend: {
			loadPath: "/locales/{{lng}}/{{ns}}.json",
		},
	});

export default i18n;
