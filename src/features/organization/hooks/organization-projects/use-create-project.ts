import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createProject,
	type OrganizationProjectCreateCredentials,
} from "../../services/organization-projects/create-project";
import type { OrganizationProject } from "../../organization.type";

export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation<
		OrganizationProject,
		Error,
		OrganizationProjectCreateCredentials
	>({
		mutationKey: ["createProject"],
		mutationFn: (credentials: OrganizationProjectCreateCredentials) =>
			createProject(credentials),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["organizationProjects", variables.organizationId],
				exact: false,
			});
		},
	});
};
