import { LockIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import { Skeleton } from "@/components/shadcn/skeleton";
import APIKeyDialog from "@/features/api-keys/components/api-key-dialog";
import APIKeyTable from "@/features/api-keys/components/api-key-table";
import { useGetApiKeys } from "@/features/api-keys/hooks/use-get-api-keys";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { blurVariants } from "@/lib/animations";

export default function APIKeysPage() {
	const { t } = useTranslation("api-keys");
	const { t: tCommon } = useTranslation("common");
	const [openApiKeyDialog, setOpenApiKeyDialog] = useState(false);

	const params = useParams();
	const projectId = params.projectId;

	const { data: apiKeys, isLoading, isError } = useGetApiKeys(projectId || "");

	const hasKeys = apiKeys && apiKeys.length > 0;

	return (
		<DashboardLayout
			pageTitle={t("pageTitle")}
			headerRight={
				<Button onClick={() => setOpenApiKeyDialog(true)}>
					<Plus /> {t("actions.create")}
				</Button>
			}
		>
			<motion.div variants={blurVariants} initial="hidden" animate="visible">
				<p className="mb-4">{t("description.permissions")}</p>
				<p className="mb-4">{t("description.security")}</p>
				<p className="mb-4">{t("description.usage")}</p>

				{isLoading && (
					<div className="mt-6 space-y-3">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				)}

				{isError && (
					<div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-md">
						{tCommon("error")}
					</div>
				)}

				{!isLoading && !isError && !hasKeys && (
					<div className="flex flex-col items-center justify-center mt-20">
						<div className="bg-muted text-muted-foreground p-4 rounded-md mb-3">
							<LockIcon />
						</div>
						<p className="font-bold">{t("emptyState.title")}</p>
						<Button className="mt-3" onClick={() => setOpenApiKeyDialog(true)}>
							<Plus />
							{t("actions.createSecret")}
						</Button>
					</div>
				)}

				{!isLoading && !isError && hasKeys && <APIKeyTable apiKeys={apiKeys} />}
			</motion.div>

			<APIKeyDialog
				open={openApiKeyDialog}
				onOpenChange={setOpenApiKeyDialog}
			/>
		</DashboardLayout>
	);
}
