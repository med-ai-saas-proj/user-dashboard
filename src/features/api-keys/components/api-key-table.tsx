import { Eye, EyeClosed, SquarePen, Trash } from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import ApiKeyDeleteDialog from "./api-key-delete-dialog";
import APIKeyUpdateDialog from "./api-key-update-dialog";
import ApiKeyUpdateStatusDialog from "./api-key-update-status-dialog";

const APIKeyTable = ({ apiKeys }: { apiKeys: APIKey[] }) => {
	const { t } = useTranslation("api-keys");

	const [openUpdateAPIKeyDialog, setOpenUpdateAPIKeyDialog] = useState(false);
	const [openUpdateStatusDialog, setOpenUpdateStatusDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);

	const onOpenUpdateStatusDialog = (apiKey: APIKey) => {
		setSelectedApiKey(apiKey);
		setOpenUpdateStatusDialog(true);
	};

	const onOpenUpdateAPIKeyDialog = (apiKey: APIKey, disabled: boolean) => {
		if (disabled) return;

		setOpenUpdateAPIKeyDialog(true);
		setSelectedApiKey(apiKey);
	};

	const onOpenDeleteDialog = (apiKey: APIKey, disabled: boolean) => {
		if (disabled) return;

		setSelectedApiKey(apiKey);
		setOpenDeleteDialog(true);
	};

	return (
		<Table className="mt-6">
			<TableHeader>
				<TableRow>
					<TableHead>{t("table.header.status")}</TableHead>
					<TableHead className="w-[20%]">{t("table.header.name")}</TableHead>
					<TableHead>{t("table.header.description")}</TableHead>
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
						<TableCell>{apiKey.description}</TableCell>
						<TableCell>{apiKey.hint}</TableCell>
						<TableCell>{apiKey.createdAt.toLocaleDateString()}</TableCell>
						<TableCell>
							<div className="flex flex-wrap items-center gap-2 max-w-[400px]">
								{apiKey.permissions.map((permission) => (
									<span
										key={permission}
										className="inline-flex items-center bg-primary text-secondary text-xs leading-none px-2 pt-1 pb-1.5 rounded-md whitespace-nowrap"
									>
										{permission}
									</span>
								))}
							</div>
						</TableCell>
						<TableCell>
							{apiKey.disabled ? (
								<EyeClosed
									size={16}
									className="cursor-pointer"
									onClick={() => onOpenUpdateStatusDialog(apiKey)}
								/>
							) : (
								<Eye
									size={16}
									className="cursor-pointer"
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
									apiKey.disabled && "opacity-50 pointer-events-none"
								)}
								onClick={() => onOpenDeleteDialog(apiKey, apiKey.disabled)}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
			{selectedApiKey && (
				<>
					<ApiKeyDeleteDialog
						open={openDeleteDialog}
						selectedApiKey={selectedApiKey}
						onOpenChange={setOpenDeleteDialog}
					/>
					<APIKeyUpdateDialog
						apikey={selectedApiKey}
						open={openUpdateAPIKeyDialog}
						onOpenChange={() => setOpenUpdateAPIKeyDialog(false)}
					/>
					<ApiKeyUpdateStatusDialog
						open={openUpdateStatusDialog}
						isDisabled={selectedApiKey.disabled}
						selectedApiKey={selectedApiKey}
						onOpenChange={setOpenUpdateStatusDialog}
					/>
				</>
			)}
		</Table>
	);
};

export default APIKeyTable;
