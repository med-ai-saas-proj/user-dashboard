import { useQuery } from "@tanstack/react-query";
import type { ProjectSettings } from "../../project.type";
import { getProjectSettings } from "../../services/project-settings/get-project-settings";

export const useGetProjectSettings = (projectId: string) => {
	return useQuery<ProjectSettings>({
		queryKey: ["project-settings", projectId],
		queryFn: () => getProjectSettings(projectId),
		enabled: !!projectId,
	});
};
