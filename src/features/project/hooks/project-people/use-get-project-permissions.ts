import { useQuery } from "@tanstack/react-query";
import { getPermissions } from "../../services/project-people/get-permissions";

export const useGetProjectPermissions = () => {
	return useQuery({
		queryKey: ["project-permissions"],
		queryFn: getPermissions,
	});
};
