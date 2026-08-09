import { Power, RotateCcw, SquarePen, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import type { APIKey } from "@/features/api-keys/api-key.type";
import { useGetApiKeyPermissions } from "@/features/api-keys/hooks/use-get-api-key-permissions";
import { cn } from "@/lib/utils";
import ApiKeyDeleteDialog from "./api-key-delete-dialog";
import APIKeyUpdateDialog from "./api-key-update-dialog";
import ApiKeyUpdateStatusDialog from "./api-key-update-status-dialog";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/shadcn/tooltip";

const APIKeyTable = ({ apiKeys }: { apiKeys: APIKey[] }) => {
	const { t } = useTranslation("api-keys");

	const [openUpdateAPIKeyDialog, setOpenUpdateAPIKeyDialog] = useState(false);
	const [openUpdateStatusDialog, setOpenUpdateStatusDialog] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
	const [selectedApiKey, setSelectedApiKey] = useState<APIKey | null>(null);

	const { data: apiKeyPermissions } = useGetApiKeyPermissions();

	const permissionNameById = useMemo(
		() =>
			new Map(apiKeyPermissions?.results?.map((p) => [p.id, p.name] as const)),
		[apiKeyPermissions]
	);

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

	const onOpenPermissionsDialog = (apiKey: APIKey) => {
		setSelectedApiKey(apiKey);
		setOpenPermissionsDialog(true);
	};

	return (
		<motion.div variants={itemVariants} initial="hidden" animate="visible">
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
									{apiKey.permissions.slice(0, 2).map((permission) => (
										<span
											key={permission}
											className="inline-flex items-center bg-primary text-secondary text-xs leading-none px-2 pt-1 pb-1.5 rounded-md whitespace-nowrap"
										>
											{permissionNameById.get(permission) ?? permission}
										</span>
									))}
									{apiKey.permissions.length > 2 && (
										<button
											type="button"
											className="inline-flex items-center rounded-md border border-dashed border-primary/30 bg-primary/5 px-2 pt-1 pb-1.5 text-xs leading-none text-primary transition-colors hover:bg-primary/10"
											onClick={() => onOpenPermissionsDialog(apiKey)}
											aria-label={`${apiKey.permissions.length - 2} more permissions`}
										>
											+{apiKey.permissions.length - 2}
										</button>
									)}
								</div>
							</TableCell>
							<TableCell className="flex items-center justify-center gap-x-6">
								{apiKey.disabled ? (
									<Tooltip>
										<TooltipContent>
											<p>{t("table.tooltip.enabled")}</p>
										</TooltipContent>
										<TooltipTrigger asChild>
											<RotateCcw
												size={16}
												className="cursor-pointer"
												onClick={() => onOpenUpdateStatusDialog(apiKey)}
											/>
										</TooltipTrigger>
									</Tooltip>
								) : (
									<Tooltip>
										<TooltipContent>
											<p>{t("table.tooltip.disabled")}</p>
										</TooltipContent>
										<TooltipTrigger asChild>
											<Power
												size={16}
												className="cursor-pointer"
												onClick={() => onOpenUpdateStatusDialog(apiKey)}
											/>
										</TooltipTrigger>
									</Tooltip>
								)}
								<Tooltip>
									<TooltipContent>
										<p>{t("table.tooltip.edit")}</p>
									</TooltipContent>
									<TooltipTrigger asChild>
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
									</TooltipTrigger>
								</Tooltip>
								<Tooltip>
									<TooltipContent>
										<p>{t("table.tooltip.delete")}</p>
									</TooltipContent>
									<TooltipTrigger asChild>
										<Trash
											size={16}
											color="#ce4034"
											className={cn(
												"cursor-pointer",
												apiKey.disabled && "opacity-50 pointer-events-none"
											)}
											onClick={() =>
												onOpenDeleteDialog(apiKey, apiKey.disabled)
											}
										/>
									</TooltipTrigger>
								</Tooltip>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
				{selectedApiKey && (
					<>
						<Dialog
							open={openPermissionsDialog}
							onOpenChange={setOpenPermissionsDialog}
						>
							<DialogContent className="sm:max-w-[480px]">
								<DialogHeader>
									<DialogTitle>{t("table.header.permissions")}</DialogTitle>
									<DialogDescription>{selectedApiKey.name}</DialogDescription>
								</DialogHeader>
								<div className="flex flex-wrap gap-2">
									{selectedApiKey.permissions.map((permission) => (
										<span
											key={permission}
											className="inline-flex items-center bg-primary text-secondary text-xs leading-none px-2 pt-1 pb-1.5 rounded-md whitespace-nowrap"
										>
											{permissionNameById.get(permission) ?? permission}
										</span>
									))}
								</div>
							</DialogContent>
						</Dialog>
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
		</motion.div>
	);
};

export default APIKeyTable;
