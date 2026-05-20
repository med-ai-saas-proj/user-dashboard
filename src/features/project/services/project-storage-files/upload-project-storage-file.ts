import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type {
	ProjectRagFileUploadInput,
	ProjectRagFileUploadResponse,
} from "../project-files.dto";

export const uploadProjectStorageFile = async ({
	projectId,
	file,
}: ProjectRagFileUploadInput): Promise<string> => {
	const formData = new FormData();
	formData.append("file", file);

	const { data } = await apiClient.post<ProjectRagFileUploadResponse>(
		API_ROUTES.FILE_STORAGE.USER,
		formData,
		{
			params: {
				project_uuid: projectId,
			},
		}
	);

	return data.file_id;
};
