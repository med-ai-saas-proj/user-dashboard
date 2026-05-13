export type ProjectRagChunkSplitter = "simple" | "recursive" | "spacy";

export type ProjectRagTaskStatus =
	| "processing"
	| "completed"
	| "failed_and_retrying"
	| "failed_and_dropped";

export type ProjectRagFileMetadata = Record<string, unknown> | null;

export type ProjectRagFileInfoResponse = {
	id: string;
	filename: string;
	mime_type: string;
	size: number;
	created_at: string;
	extra_metadata: ProjectRagFileMetadata;
};

export type ProjectRagFile = {
	id: string;
	filename: string;
	mimeType: string;
	size: number;
	createdAt: Date;
	extraMetadata: ProjectRagFileMetadata;
	tags: string[];
};

export type ProjectRagFileUploadResponse = {
	file_id: string;
};

export type ProjectRagFileTaskResponse = {
	task_id: string;
	file_uid: string;
	project_uuid: string;
	chunk_splitter: ProjectRagChunkSplitter;
	chunk_size: number;
	chunk_overlap: number;
	status: ProjectRagTaskStatus;
};

export type ProjectRagFileUploadInput = {
	projectId: string;
	file: File;
};

export type ProjectRagFileCreateInput = {
	projectId: string;
	fileId: string;
	chunkSplitter?: ProjectRagChunkSplitter;
	chunkSize?: number;
	chunkOverlap?: number;
};

export type ProjectRagFileDeleteInput = {
	projectId: string;
	fileId: string;
};

export type ProjectRagFileDownloadUrlInput = {
	projectId: string;
	fileId: string;
};

export type ProjectRagFileMetadataInput = {
	projectId: string;
	fileId: string;
	extraMetadata: Record<string, unknown>;
};

const isStringArray = (value: unknown): value is string[] => {
	return (
		Array.isArray(value) && value.every((item) => typeof item === "string")
	);
};

export const getProjectRagFileTags = (
	extraMetadata: ProjectRagFileMetadata
): string[] => {
	if (!extraMetadata || typeof extraMetadata !== "object") {
		return [];
	}

	const tags = (extraMetadata as { tags?: unknown }).tags;
	if (typeof tags === "string") {
		return tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
	}
	return isStringArray(tags) ? tags : [];
};

export const mapProjectRagFileResponse = (
	file: ProjectRagFileInfoResponse
): ProjectRagFile => {
	return {
		id: file.id,
		filename: file.filename,
		mimeType: file.mime_type,
		size: file.size,
		createdAt: new Date(file.created_at),
		extraMetadata: file.extra_metadata,
		tags: getProjectRagFileTags(file.extra_metadata),
	};
};
