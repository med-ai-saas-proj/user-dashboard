import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectStorageFile } from "../../services/project-storage-files/delete-project-storage-file";
import type { ProjectRagFileDeleteInput } from "../../services/project-files.dto";

export const useDeleteProjectStorageFile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ProjectRagFileDeleteInput) =>
			deleteProjectStorageFile(payload),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["project-storage-files", variables.projectId],
				exact: false,
			});
		},
	});
};
