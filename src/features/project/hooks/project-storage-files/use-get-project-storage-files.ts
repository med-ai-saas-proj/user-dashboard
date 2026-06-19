import { useQuery } from "@tanstack/react-query";
import { getProjectStorageFiles } from "../../services/project-storage-files/get-project-storage-files";

export const useGetProjectStorageFiles = (projectId: string) => {
	return useQuery({
		queryKey: ["project-storage-files", projectId],
		queryFn: () => getProjectStorageFiles(projectId),
		enabled: !!projectId,
	});
};
