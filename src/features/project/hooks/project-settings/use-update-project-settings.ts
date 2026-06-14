import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectSettings } from "../../project.type";
import { updateProjectSettings } from "@/features/project/services/project-settings/update-project-settings";

export const useUpdateProjectSettings = (projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ProjectSettings) =>
			updateProjectSettings(projectId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project-settings", projectId],
			});
		},
	});
};
