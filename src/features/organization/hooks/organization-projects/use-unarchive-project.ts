import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	unarchiveProject,
	type OrganizationProjectUnarchiveCredentials,
} from "../../services/organization-projects/unarchive-project";
import type { OrganizationProjectArchive } from "../../organization.type";

export const useUnarchiveProject = () => {
	const queryClient = useQueryClient();

	return useMutation<
		OrganizationProjectArchive,
		Error,
		OrganizationProjectUnarchiveCredentials
	>({
		mutationFn: unarchiveProject,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organizationProjects"],
				exact: false,
			});
		},
	});
};
