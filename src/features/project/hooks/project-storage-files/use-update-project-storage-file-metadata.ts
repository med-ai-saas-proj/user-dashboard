import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProjectStorageFileMetadata } from "../../services/project-storage-files/update-project-storage-file-metadata";
import type { ProjectRagFileMetadataInput } from "../../services/project-files.dto";

export const useUpdateProjectStorageFileMetadata = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileMetadataInput) =>
			updateProjectStorageFileMetadata(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-storage-files", variables.projectId],
				exact: false,
			});
		},
	});
};
