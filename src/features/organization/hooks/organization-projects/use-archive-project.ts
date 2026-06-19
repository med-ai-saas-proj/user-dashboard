import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	archiveProject,
	type OrganizationProjectArchiveCredentials,
} from "../../services/organization-projects/archive-project";
import type { OrganizationProjectArchive } from "../../organization.type";

export const useArchiveProject = () => {
	const queryClient = useQueryClient();

	return useMutation<
		OrganizationProjectArchive,
		Error,
		OrganizationProjectArchiveCredentials
	>({
		mutationFn: archiveProject,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organizationProjects"],
				exact: false,
			});
		},
	});
};
