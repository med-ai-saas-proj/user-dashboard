import { useQuery } from "@tanstack/react-query";
import { getProjectRagFiles } from "../../services/project-rag-files/get-project-rag-files";

export const useGetProjectRagFiles = (projectId: string) => {
	return useQuery({
		queryKey: ["project-rag-files", projectId],
		queryFn: () => getProjectRagFiles(projectId),
		enabled: !!projectId,
	});
};
