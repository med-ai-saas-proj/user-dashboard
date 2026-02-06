import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type {
	RxAdvisorRequest,
	RxAdvisorResponse,
	RxChatRequest,
	RxChatResponse,
} from "./rx-advisor.dto";

export const getRxAdvisor = async (
	request: RxAdvisorRequest
): Promise<RxAdvisorResponse> => {
	const req: RxChatRequest = {
		model: "",
		conversation_id: null,
		prescription: request.prescription,
		ehr: request.ehr,
		stream: request.stream,
	};
	const { data } = await apiClient.post<RxChatResponse>(
		API_ROUTES.SERVICES.RX_ADVISOR,
		req
	);
	return {
		used_tools: [],
		analysis: data.output.at(-1)?.content ?? "Error, pls try again",
		reasoning: "",
	};
};
