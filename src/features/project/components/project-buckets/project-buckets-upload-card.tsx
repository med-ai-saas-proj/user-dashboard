import type { ChangeEvent, DragEvent, RefObject } from "react";
import { UploadCloud } from "lucide-react";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";

type ProjectBucketsUploadCardProps = {
	inputRef: RefObject<HTMLInputElement | null>;
	isDragging: boolean;
	isUploading: boolean;
	isBusy: boolean;
	uploadTitle: string;
	uploadAction: string;
	uploadProcessing: string;
	uploadHint: string;
	uploadSupportedTypes: string;
	uploadBrowseTitle: string;
	onOpenFilePicker: () => void;
	onDragOver: (event: DragEvent<HTMLButtonElement>) => void;
	onDragLeave: () => void;
	onDrop: (event: DragEvent<HTMLButtonElement>) => void;
	onFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ProjectBucketsUploadCard({
	inputRef,
	isDragging,
	isUploading,
	isBusy,
	uploadTitle,
	uploadAction,
	uploadProcessing,
	uploadHint,
	uploadSupportedTypes,
	uploadBrowseTitle,
	onOpenFilePicker,
	onDragOver,
	onDragLeave,
	onDrop,
	onFileInput,
}: ProjectBucketsUploadCardProps) {
	return (
		<div className="w-full">
			<div className="space-y-1.5">
				<h2 className="text-2xl font-bold tracking-tight">{uploadTitle}</h2>
				<p className="text-muted-foreground">{uploadAction}</p>
			</div>

			<div className="mt-6 rounded-lg border border-border bg-background p-0">
				<button
					type="button"
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					className={cn(
						"flex mx-auto w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center transition-colors",
						isDragging
							? "border-primary bg-accent"
							: "border-border bg-background hover:bg-accent/50"
					)}
					onClick={onOpenFilePicker}
				>
					<div className="flex flex-col items-center gap-3">
						<div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
							{isUploading ? (
								<Spinner className="size-6" />
							) : (
								<UploadCloud className="size-6 text-foreground" />
							)}
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-foreground">
								{isUploading ? uploadProcessing : uploadAction}
							</p>
							<p className="text-sm text-muted-foreground">{uploadHint}</p>
							<p className="text-xs text-muted-foreground">
								{uploadSupportedTypes}
							</p>
						</div>
					</div>
					<input
						ref={inputRef}
						title={uploadBrowseTitle}
						type="file"
						className="hidden"
						multiple
						onChange={onFileInput}
						disabled={isBusy}
					/>
				</button>
			</div>
		</div>
	);
}
