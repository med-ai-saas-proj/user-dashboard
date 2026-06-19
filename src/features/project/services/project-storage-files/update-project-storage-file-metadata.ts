import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileMetadataInput } from "../project-files.dto";

export const updateProjectStorageFileMetadata = async ({
	projectId,
	fileId,
	extraMetadata,
}: ProjectRagFileMetadataInput): Promise<void> => {
	await apiClient.put(
		`${API_ROUTES.FILE_STORAGE.USER}${fileId}/metadata`,
		{
			extra_metadata: extraMetadata,
		},
		{
			params: {
				project_uuid: projectId,
			},
		}
	);
};
