import { useTranslation } from "react-i18next";

const LoadingPage = () => {
	const { t } = useTranslation("common");

	return (
		<div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
			<div className="animate-spin size-10 border-4 rounded-full border-muted-foreground border-t-transparent"></div>
			<p className="mt-4 text-muted-foreground">{t("loading")}</p>
		</div>
	);
};

export default LoadingPage;
