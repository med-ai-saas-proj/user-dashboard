import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileTaskResponse } from "./project-rag-file.dto";

export const getProjectRagFileTaskStatus = async (
	projectId: string,
	taskId: string
): Promise<ProjectRagFileTaskResponse> => {
	const { data } = await apiClient.get<ProjectRagFileTaskResponse>(
		`${API_ROUTES.RAG.USER_BASE}/${projectId}/files/${taskId}`
	);

	return data;
};
