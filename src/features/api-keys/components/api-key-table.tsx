import { SquarePen, Trash } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import type { APIKey } from "@/features/api-keys/api-key.type";
import { useDeleteApiKey } from "@/features/api-keys/hooks/use-delete-api-key";
import { cn } from "@/lib/utils";
import APIKeyUpdateDialog from "./api-key-update-dialog";

const APIKeyTable = ({ apiKeys }: { apiKeys: APIKey[] }) => {
	const { t } = useTranslation("api-keys");

	const deleteAPIKeyMutation = useDeleteApiKey();
	const [openUpdateAPIKeyDialog, setOpenUpdateAPIKeyDialog] =
		React.useState(false);
	const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);

	const onDeleteApiKey = (apikeyId: string) => {
		deleteAPIKeyMutation.mutate(apikeyId);
	};

	const onOpenUpdateAPIKeyDialog = (selectedApiKeyId: string) => {
		setOpenUpdateAPIKeyDialog(true);
		setSelectedApiKeyId(selectedApiKeyId);
	};

	return (
		<Table className="mt-6">
			<TableHeader>
				<TableRow>
					<TableHead className="w-[30%]">{t("table.header.name")}</TableHead>
					<TableHead>{t("table.header.description")}</TableHead>
					<TableHead>{t("table.header.secretKey")}</TableHead>
					<TableHead>{t("table.header.createdAt")}</TableHead>
					<TableHead>{t("table.header.permissions")}</TableHead>
					<TableHead></TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{apiKeys.map((apiKey) => (
					<TableRow key={apiKey.id}>
						<TableCell className="font-medium">{apiKey.name}</TableCell>
						<TableCell>{apiKey.description}</TableCell>
						<TableCell>{apiKey.hint}</TableCell>
						<TableCell>{apiKey.createdAt.toLocaleDateString()}</TableCell>
						<TableCell>{apiKey.permissions.join(", ")}</TableCell>
						<TableCell>
							<SquarePen
								size={16}
								className="cursor-pointer"
								onClick={() => onOpenUpdateAPIKeyDialog(apiKey.id)}
							/>
						</TableCell>
						<TableCell>
							<Trash
								size={16}
								color="#ce4034"
								className={cn(
									"cursor-pointer",
									deleteAPIKeyMutation.isPending &&
										"opacity-50 pointer-events-none"
								)}
								onClick={() => onDeleteApiKey(apiKey.id)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			{selectedApiKeyId && (
				<APIKeyUpdateDialog
					apikeyId={selectedApiKeyId}
					open={openUpdateAPIKeyDialog}
					onOpenChange={() => setOpenUpdateAPIKeyDialog(false)}
				/>
			)}
		</Table>
	);
};

export default APIKeyTable;
