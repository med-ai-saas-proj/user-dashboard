import { useQuery } from "@tanstack/react-query";
import { getOrganizationPermissions } from "../../services/organization-people/get-permissions";

export const useGetOrganizationPermissions = () => {
	return useQuery({
		queryKey: ["organization-permissions"],
		queryFn: getOrganizationPermissions,
	});
};
