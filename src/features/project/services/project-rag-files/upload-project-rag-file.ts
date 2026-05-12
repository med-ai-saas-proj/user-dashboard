import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import { getProjectRagFileTaskStatus } from "./get-project-rag-file-task-status";
import type {
	ProjectRagFileCreateInput,
	ProjectRagFileTaskResponse,
	ProjectRagFileUploadInput,
	ProjectRagFileUploadResponse,
} from "./project-rag-file.dto";

const DEFAULT_CHUNK_SPLITTER: ProjectRagFileCreateInput["chunkSplitter"] =
	"recursive";
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 150;
const TASK_POLL_INTERVAL_MS = 1500;
const TASK_POLL_TIMEOUT_MS = 5 * 60 * 1000;

const sleep = (ms: number) =>
	new Promise((resolve) => window.setTimeout(resolve, ms));

const waitForProjectRagFileTaskCompletion = async (
	projectId: string,
	taskId: string
): Promise<ProjectRagFileTaskResponse> => {
	const startedAt = Date.now();

	while (true) {
		const task = await getProjectRagFileTaskStatus(projectId, taskId);

		if (task.status !== "processing") {
			return task;
		}

		if (Date.now() - startedAt > TASK_POLL_TIMEOUT_MS) {
			throw new Error("Timed out while processing the RAG file upload.");
		}

		await sleep(TASK_POLL_INTERVAL_MS);
	}
};

const uploadProjectRagFileToStorage = async ({
	projectId,
	file,
}: ProjectRagFileUploadInput): Promise<string> => {
	const formData = new FormData();
	formData.append("file", file);

	// Upload to the service-level file-storage endpoint (requires X-Api-Key)
	const { data } = await apiClient.post<ProjectRagFileUploadResponse>(
		API_ROUTES.FILE_STORAGE.SERVICE,
		formData
	);

	return data.file_id;
};

const createProjectRagFileTask = async ({
	projectId,
	fileId,
	chunkSplitter = DEFAULT_CHUNK_SPLITTER,
	chunkSize = DEFAULT_CHUNK_SIZE,
	chunkOverlap = DEFAULT_CHUNK_OVERLAP,
}: ProjectRagFileCreateInput): Promise<ProjectRagFileTaskResponse> => {
	const { data } = await apiClient.post<ProjectRagFileTaskResponse>(
		`${API_ROUTES.RAG.USER_BASE}/${projectId}/files`,
		{
			file_uid: fileId,
			chunk_splitter: chunkSplitter,
			chunk_size: chunkSize,
			chunk_overlap: chunkOverlap,
		}
	);

	return data;
};

export const uploadProjectRagFile = async ({
	projectId,
	file,
}: ProjectRagFileUploadInput): Promise<ProjectRagFileTaskResponse> => {
	const fileId = await uploadProjectRagFileToStorage({ projectId, file });
	const task = await createProjectRagFileTask({ projectId, fileId });

	return waitForProjectRagFileTaskCompletion(projectId, task.task_id);
};
