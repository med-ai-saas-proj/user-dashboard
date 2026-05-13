import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProjectRagFile } from "../../services/project-rag-files/add-project-rag-file";
import type { ProjectRagFileCreateInput } from "../../services/project-files.dto";

export const useAddProjectRagFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileCreateInput) =>
			addProjectRagFile(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-rag-files", variables.projectId],
				exact: false,
			});
		},
	});
};
