import { Eye, EyeClosed, SquarePen, Trash } from "lucide-react";
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
import { useEnableApiKey } from "../hooks/use-enable-api-key";
import { useDisableApiKey } from "../hooks/use-disable-api-key";
import ApiKeyUpdateStatusDialog from "./api-key-update-status-dialog";

const APIKeyTable = ({ apiKeys }: { apiKeys: APIKey[] }) => {
	const { t } = useTranslation("api-keys");

	const deleteAPIKeyMutation = useDeleteApiKey();
	const enableAPIKeyMutation = useEnableApiKey();
	const disableAPIKeyMutation = useDisableApiKey();

	const [openUpdateAPIKeyDialog, setOpenUpdateAPIKeyDialog] =
		React.useState(false);
	const [openUpdateStatusDialog, setOpenUpdateStatusDialog] =
		React.useState(false);
	const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);

	const onDeleteApiKey = (apikeyId: string, disabled: boolean) => {
		if (disabled) return;

		deleteAPIKeyMutation.mutate(apikeyId);
	};

	const onOpenUpdateStatusDialog = (apiKey: APIKey) => {
		setSelectedApiKey(apiKey);
		setOpenUpdateStatusDialog(true);
	};

	const onAgreeUpdateApiKeyStatus = () => {
		if (!selectedApiKey) return;

		setOpenUpdateStatusDialog(false);

		if (selectedApiKey.disabled) {
			enableAPIKeyMutation.mutate(selectedApiKey.id);
			return;
		}

		disableAPIKeyMutation.mutate(selectedApiKey.id);
	};

	const onOpenUpdateAPIKeyDialog = (apiKey: APIKey, disabled: boolean) => {
		if (disabled) return;

		setOpenUpdateAPIKeyDialog(true);
		setSelectedApiKey(apiKey);
	};

	return (
		<Table className="mt-6">
			<TableHeader>
				<TableRow>
					<TableHead>{t("table.header.status")}</TableHead>
					<TableHead className="w-[20%]">{t("table.header.name")}</TableHead>
					<TableHead>{t("table.header.projectId")}</TableHead>
					<TableHead>{t("table.header.secretKey")}</TableHead>
					<TableHead>{t("table.header.createdAt")}</TableHead>
					<TableHead>{t("table.header.permissions")}</TableHead>
					<TableHead></TableHead>
					<TableHead></TableHead>
					<TableHead></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{apiKeys.map((apiKey) => (
					<TableRow key={apiKey.id}>
						<TableCell>
							{apiKey.disabled
								? t("table.header.disabled")
								: t("table.header.enabled")}
						</TableCell>
						<TableCell className="font-medium">{apiKey.name}</TableCell>
						<TableCell>{apiKey.projectId}</TableCell>
						<TableCell>{apiKey.hint}</TableCell>
						<TableCell>{apiKey.createdAt.toLocaleDateString()}</TableCell>
						<TableCell>
							<div className="flex flex-wrap items-center gap-2 max-w-[360px]">
								{apiKey.permissions.slice(0, 3).map((permission) => (
									<span
										key={permission}
										className="inline-flex items-center bg-primary text-secondary text-xs leading-none px-2 pt-1 pb-1.5 rounded-md whitespace-nowrap"
									>
										{permission}
									</span>
								))}
								{apiKey.permissions.length > 3 && (
									<span className="inline-flex items-center bg-muted text-muted-foreground text-xs leading-none px-2 pt-1 pb-1.5 rounded-md whitespace-nowrap">
										+{apiKey.permissions.length - 3} more
									</span>
								)}
							</div>
						</TableCell>
						<TableCell>
							{apiKey.disabled ? (
								<EyeClosed
									size={16}
									className={cn(
										"cursor-pointer",
										(enableAPIKeyMutation.isPending ||
											disableAPIKeyMutation.isPending) &&
											"opacity-50 pointer-events-none"
									)}
									onClick={() => onOpenUpdateStatusDialog(apiKey)}
								/>
							) : (
								<Eye
									size={16}
									className={cn(
										"cursor-pointer",
										(enableAPIKeyMutation.isPending ||
											disableAPIKeyMutation.isPending) &&
											"opacity-50 pointer-events-none"
									)}
									onClick={() => onOpenUpdateStatusDialog(apiKey)}
								/>
							)}
						</TableCell>
						<TableCell>
							<SquarePen
								size={16}
								className={cn(
									"cursor-pointer",
									apiKey.disabled && "opacity-50 pointer-events-none"
								)}
								onClick={() =>
									onOpenUpdateAPIKeyDialog(apiKey, apiKey.disabled)
								}
							/>
						</TableCell>
						<TableCell>
							<Trash
								size={16}
								color="#ce4034"
								className={cn(
									"cursor-pointer",
									(apiKey.disabled || deleteAPIKeyMutation.isPending) &&
										"opacity-50 pointer-events-none"
								)}
								onClick={() => onDeleteApiKey(apiKey.id, apiKey.disabled)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			{selectedApiKey && (
				<>
					<APIKeyUpdateDialog
						apikey={selectedApiKey}
						open={openUpdateAPIKeyDialog}
						onOpenChange={() => setOpenUpdateAPIKeyDialog(false)}
					/>
					<ApiKeyUpdateStatusDialog
						open={openUpdateStatusDialog}
						isDisabled={selectedApiKey.disabled}
						isSubmitting={
							enableAPIKeyMutation.isPending || disableAPIKeyMutation.isPending
						}
						onOpenChange={setOpenUpdateStatusDialog}
						onAgree={onAgreeUpdateApiKeyStatus}
					/>
				</>
			)}
		</Table>
	);
};

export default APIKeyTable;
