import { useQuery } from "@tanstack/react-query";
import { getProjectDetails } from "../../services/project-general/get-project-details";

export const useGetProjectDetails = (projectId: string) => {
	return useQuery({
		queryKey: ["projectDetails", projectId],
		queryFn: () => getProjectDetails(projectId),
		enabled: !!projectId,
	});
};
