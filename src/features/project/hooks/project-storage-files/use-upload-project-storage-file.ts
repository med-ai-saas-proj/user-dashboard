import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProjectStorageFile } from "../../services/project-storage-files/upload-project-storage-file";
import type { ProjectRagFileUploadInput } from "../../services/project-files.dto";

export const useUploadProjectStorageFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileUploadInput) =>
			uploadProjectStorageFile(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-storage-files", variables.projectId],
				exact: false,
			});
		},
	});
};
