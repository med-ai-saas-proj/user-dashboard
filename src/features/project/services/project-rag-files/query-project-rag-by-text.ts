import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import {
	mapProjectRagQueryResponse,
	type ProjectRagQueryResult,
	type ProjectRagQueryResponse,
} from "../project-files.dto";

export type ProjectRagTextQueryInput = {
	projectId: string;
	queryText: string;
	topK?: number;
	includeEmbedding?: boolean;
};

export const queryProjectRagByText = async ({
	projectId,
	queryText,
	topK = 5,
	includeEmbedding = false,
}: ProjectRagTextQueryInput): Promise<ProjectRagQueryResult[]> => {
	const { data } = await apiClient.post<ProjectRagQueryResponse[]>(
		API_ROUTES.RAG.USER_QUERY_TEXT,
		{
			query_text: queryText,
			top_k: topK,
		},
		{
			params: {
				project_uuid: projectId,
				include_embedding: includeEmbedding,
			},
		}
	);

	return data
		.map(mapProjectRagQueryResponse)
		.sort(
			(left, right) => right.createdAt.getTime() - left.createdAt.getTime()
		);
};
