import { ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

const PermissionDeniedBlock = (): React.JSX.Element => {
	const { t } = useTranslation("common");

	return (
		<div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed border-border bg-muted/30">
			<div className="p-4 bg-destructive/10 rounded-full mb-4">
				<ShieldAlert className="w-8 h-8 text-destructive" />
			</div>
			<h3 className="text-lg font-semibold mb-2">
				{t("permission-denied.title")}
			</h3>
			<p className="text-muted-foreground max-w-fit">
				{t("permission-denied.description")}
			</p>
		</div>
	);
};

export default PermissionDeniedBlock;
