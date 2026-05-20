import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileDeleteInput } from "../project-files.dto";

export const deleteProjectStorageFile = async ({
	projectId,
	fileId,
}: ProjectRagFileDeleteInput): Promise<void> => {
	await apiClient.delete(`${API_ROUTES.FILE_STORAGE.USER}${fileId}`, {
		params: {
			project_uuid: projectId,
		},
	});
};
