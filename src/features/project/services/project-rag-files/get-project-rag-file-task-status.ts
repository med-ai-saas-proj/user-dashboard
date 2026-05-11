import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileTaskResponse } from "./project-rag-file.dto";

export const getProjectRagFileTaskStatus = async (
	taskId: string
): Promise<ProjectRagFileTaskResponse> => {
	const { data } = await apiClient.get<ProjectRagFileTaskResponse>(
		`${API_ROUTES.RAG.USER_FILE_TASK}${taskId}`
	);

	return data;
};
