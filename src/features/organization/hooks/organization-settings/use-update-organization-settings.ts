import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrganizationSettings } from "../../services/organization-settings/update-organization-settings";
import type { OrganizationSettings } from "../../organization.type";

export const useUpdateOrganizationSettings = (organizationId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: OrganizationSettings) =>
			updateOrganizationSettings(organizationId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["organization-settings", organizationId],
			});
		},
	});
};
