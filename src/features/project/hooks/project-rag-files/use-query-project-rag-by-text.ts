import { useMutation } from "@tanstack/react-query";
import {
	queryProjectRagByText,
	type ProjectRagTextQueryInput,
} from "../../services/project-rag-files/query-project-rag-by-text";

export const useQueryProjectRagByText = () => {
	return useMutation({
		mutationFn: (payload: ProjectRagTextQueryInput) =>
			queryProjectRagByText(payload),
	});
};
