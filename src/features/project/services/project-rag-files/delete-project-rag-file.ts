import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileDeleteInput } from "./project-rag-file.dto";

export const deleteProjectRagFile = async ({
	projectId: _projectId,
	fileId,
}: ProjectRagFileDeleteInput): Promise<void> => {
	await apiClient.delete(`${API_ROUTES.FILE_STORAGE.SERVICE}${fileId}`);
};
