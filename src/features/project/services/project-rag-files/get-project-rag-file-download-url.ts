import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { ProjectRagFileDownloadUrlInput } from "./project-rag-file.dto";

type ProjectRagFileDownloadUrlResponse = {
	url: string;
};

export const getProjectRagFileDownloadUrl = async ({
	projectId,
	fileId,
}: ProjectRagFileDownloadUrlInput): Promise<string> => {
	const { data } = await apiClient.get<ProjectRagFileDownloadUrlResponse>(
		`${API_ROUTES.FILE_STORAGE.USER}${fileId}/presigned-url`,
		{
			params: {
				project_uuid: projectId,
			},
		}
	);

	return data.url;
};
