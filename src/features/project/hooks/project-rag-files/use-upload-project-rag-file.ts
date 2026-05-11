import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProjectRagFile } from "../../services/project-rag-files/upload-project-rag-file";
import type { ProjectRagFileUploadInput } from "../../services/project-rag-files/project-rag-file.dto";

export const useUploadProjectRagFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileUploadInput) =>
			uploadProjectRagFile(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-rag-files", variables.projectId],
				exact: false,
			});
		},
	});
};
