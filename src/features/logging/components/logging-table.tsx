import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, CopyIcon, CheckIcon } from "lucide-react";
import type { LoggingResponse } from "../types/logging";
import { Button } from "@/components/shadcn/button";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/shadcn/table";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetClose,
} from "@/components/shadcn/sheet";
import { formatIsoToLocaleDateTime } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface LoggingTableProps {
	data?: LoggingResponse[];
	locale?: string;
}

const buildContentPreview = (log: LoggingResponse): string => {
	const preview: Record<string, unknown> = {
		event: log.event,
		pathname: log.pathname,
		func_name: log.func_name,
		lineno: log.lineno,
	};
	if (log.requestId !== null) {
		preview.requestId = log.requestId;
	}
	return JSON.stringify(preview);
};

const levelBadgeClass = (level: string): string => {
	switch (level.toLowerCase()) {
		case "error":
			return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
		case "warn":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
		case "info":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
		case "debug":
			return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400";
	}
};

const LoggingTable = ({
	data,
	locale = "en",
}: LoggingTableProps): React.JSX.Element => {
	const { t, i18n } = useTranslation("logging");
	const currentLocale = locale || i18n.language || "en";
	const { copy, isCopied } = useCopyToClipboard();
	const [selectedLog, setSelectedLog] = useState<LoggingResponse | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const handleViewLog = (log: LoggingResponse) => {
		setSelectedLog(log);
		setSheetOpen(true);
	};

	const handleCopyLog = async () => {
		if (selectedLog) {
			await copy(JSON.stringify(selectedLog, null, 2));
		}
	};

	if (!data || data.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground">
				No log entries found.
			</div>
		);
	}

	return (
		<>
			<div className="bg-background w-full max-w-full">
				<div className="max-h-[calc(110vh-300px)] flex flex-col">
					<div className="flex-none">
						<Table className="w-full border-separate border-spacing-0">
							<TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
								<TableRow>
									<TableHead>{t("table.date")}</TableHead>
									<TableHead>{t("table.level")}</TableHead>
									<TableHead className="max-w-md">
										{t("table.content")}
									</TableHead>
									<TableHead className="w-20 text-center">
										{t("table.actions")}
									</TableHead>
								</TableRow>
							</TableHeader>
						</Table>
					</div>

					<div className="flex-1 overflow-y-auto">
						<Table className="w-full border-separate border-spacing-0 [&_td]:border-border [&_tr:not(:last-child)_td]:border-b">
							<TableBody>
								{data.map((log, index) => (
									<TableRow key={log.timestamp + (log.requestId ?? "") + index}>
										<TableCell className="whitespace-nowrap text-xs font-mono">
											{formatIsoToLocaleDateTime(
												new Date(log.timestamp * 1000).toISOString(),
												currentLocale
											)}
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${levelBadgeClass(log.level)}`}
											>
												{log.level}
											</span>
										</TableCell>
										<TableCell className="max-w-md">
											<code className="text-xs text-muted-foreground line-clamp-2 break-all font-mono block leading-relaxed">
												{buildContentPreview(log)}
											</code>
										</TableCell>
										<TableCell className="text-center">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleViewLog(log)}
												aria-label={t("table.actions")}
											>
												<EyeIcon className="size-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className="flex-none">
						<Table className="w-full border-separate border-spacing-0">
							<TableFooter className="sticky bottom-0 bg-background">
								<TableRow>
									<TableCell colSpan={3}>Total</TableCell>
									<TableCell className="text-center">{data.length}</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</div>
				</div>
			</div>

			{/* Log Detail Sheet */}
			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent className="sm:max-w-2xl w-full">
					<SheetHeader className="border-b pb-4">
						<SheetTitle>{t("detail.title")}</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto py-4">
						<pre className="bg-muted rounded-lg p-4 text-xs font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-[70vh]">
							{selectedLog && JSON.stringify(selectedLog, null, 2)}
						</pre>
					</div>

					<div className="border-t p-4 flex items-center justify-end gap-2">
						<SheetClose asChild>
							<Button variant="outline">{t("filter.cancel")}</Button>
						</SheetClose>
						<Button variant="default" onClick={handleCopyLog} className="gap-2">
							{isCopied ? (
								<>
									<CheckIcon className="size-4" />
									{t("detail.copied")}
								</>
							) : (
								<>
									<CopyIcon className="size-4" />
									{t("detail.copy")}
								</>
							)}
						</Button>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default LoggingTable;
