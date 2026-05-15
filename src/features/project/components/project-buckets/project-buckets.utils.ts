export const ACCEPTED_TYPES = [
	"application/pdf",
	"text/plain",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/msword",
];

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const isSupportedFile = (file: File) => {
	if (ACCEPTED_TYPES.includes(file.type)) {
		return true;
	}

	return /\.(pdf|txt|doc|docx)$/i.test(file.name);
};

export const getFileTypeLabel = (mimeType: string, filename: string) => {
	if (mimeType.includes("pdf") || filename.toLowerCase().endsWith(".pdf")) {
		return "PDF";
	}

	if (
		mimeType.includes("wordprocessingml") ||
		filename.toLowerCase().endsWith(".docx")
	) {
		return "DOCX";
	}

	if (mimeType.includes("msword") || filename.toLowerCase().endsWith(".doc")) {
		return "DOC";
	}

	if (mimeType.startsWith("text/")) {
		return "TXT";
	}

	return mimeType || "FILE";
};

export const formatFileSize = (sizeInBytes: number) => {
	if (sizeInBytes < 1024) {
		return `${sizeInBytes} B`;
	}

	const units = ["KB", "MB", "GB", "TB"];
	let size = sizeInBytes / 1024;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex += 1;
	}

	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};
