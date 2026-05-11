import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileMetadataInput } from "./project-rag-file.dto";

export const updateProjectRagFileMetadata = async ({
	projectId,
	fileId,
	extraMetadata,
}: ProjectRagFileMetadataInput): Promise<void> => {
	await apiClient.put(
		`${API_ROUTES.FILE_STORAGE.USER}${projectId}/${fileId}/metadata`,
		{
			extra_metadata: extraMetadata,
		}
	);
};
