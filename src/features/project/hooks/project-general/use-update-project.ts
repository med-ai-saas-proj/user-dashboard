import { updateProject } from "../../services/project-general/update-project";
import type { UpdateProjectCredentials } from "../../services/project-general/update-project";
import { useMutation } from "@tanstack/react-query";

export const useUpdateProject = () => {
	return useMutation({
		mutationKey: ["update-project"],
		mutationFn: (credentials: UpdateProjectCredentials) =>
			updateProject(credentials),
	});
};
