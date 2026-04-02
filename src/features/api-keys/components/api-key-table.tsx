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
	const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);

	const onDeleteApiKey = (apikeyId: string) => {
		deleteAPIKeyMutation.mutate(apikeyId);
	};

	const onOpenUpdateAPIKeyDialog = (apiKey: APIKey) => {
		setOpenUpdateAPIKeyDialog(true);
		setSelectedApiKey(apiKey);
	};

	return (
		<Table className="mt-6">
			<TableHeader>
				<TableRow>
					<TableHead className="w-[30%]">{t("table.header.name")}</TableHead>
					<TableHead>{t("table.header.projectId")}</TableHead>
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
						<TableCell>{apiKey.projectId}</TableCell>
						<TableCell>{apiKey.hint}</TableCell>
						<TableCell>{apiKey.createdAt.toLocaleDateString()}</TableCell>
						<TableCell>
							<div className="flex flex-wrap items-center gap-2 max-w-[360px]">
								{apiKey.permissions.slice(0, 3).map((permission) => (
									<span
										key={permission}
										className="inline-flex items-center bg-primary text-secondary text-xs leading-none px-2 py-1 rounded-md whitespace-nowrap"
									>
										{permission}
									</span>
								))}
								{apiKey.permissions.length > 3 && (
									<span className="inline-flex items-center bg-muted text-muted-foreground text-xs leading-none px-2 py-1 rounded-md whitespace-nowrap">
										+{apiKey.permissions.length - 3} more
									</span>
								)}
							</div>
						</TableCell>
						<TableCell>
							<SquarePen
								size={16}
								className="cursor-pointer"
								onClick={() => onOpenUpdateAPIKeyDialog(apiKey)}
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
			{selectedApiKey && (
				<APIKeyUpdateDialog
					apikey={selectedApiKey}
					open={openUpdateAPIKeyDialog}
					onOpenChange={() => setOpenUpdateAPIKeyDialog(false)}
				/>
			)}
		</Table>
	);
};

export default APIKeyTable;
