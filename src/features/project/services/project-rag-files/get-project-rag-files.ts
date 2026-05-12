import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import {
	mapProjectRagFileResponse,
	type ProjectRagFile,
	type ProjectRagFileInfoResponse,
} from "./project-rag-file.dto";

export const getProjectRagFiles = async (
	projectId: string
): Promise<ProjectRagFile[]> => {
	const { data } = await apiClient.get<ProjectRagFileInfoResponse[]>(
		API_ROUTES.FILE_STORAGE.USER,
		{
			params: {
				project_uuid: projectId,
			},
		}
	);

	return data
		.map(mapProjectRagFileResponse)
		.sort(
			(left, right) => right.createdAt.getTime() - left.createdAt.getTime()
		);
};
