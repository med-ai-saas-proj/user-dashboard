import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectRagFile } from "../../services/project-rag-files/delete-project-rag-file";
import type { ProjectRagFileDeleteInput } from "../../services/project-rag-files/project-rag-file.dto";

export const useDeleteProjectRagFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileDeleteInput) =>
			deleteProjectRagFile(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-rag-files", variables.projectId],
				exact: false,
			});
		},
	});
};
