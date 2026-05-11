import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectRagFileMetadata } from "../../services/project-rag-files/update-project-rag-file-metadata";
import type { ProjectRagFileMetadataInput } from "../../services/project-rag-files/project-rag-file.dto";

export const useUpdateProjectRagFileMetadata = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileMetadataInput) =>
			updateProjectRagFileMetadata(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-rag-files", variables.projectId],
				exact: false,
			});
		},
	});
};
