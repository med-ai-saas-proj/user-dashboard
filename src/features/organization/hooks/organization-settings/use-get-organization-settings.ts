import { useQuery } from "@tanstack/react-query";
import type { OrganizationSettings } from "../../organization.type";
import { getOrganizationSettings } from "../../services/organization-settings/get-organization-settings";

export const useGetOrganizationSettings = (organizationId: string) => {
	return useQuery<OrganizationSettings>({
		queryKey: ["organization-settings", organizationId],
		queryFn: () => getOrganizationSettings(organizationId),
		enabled: !!organizationId,
	});
};
