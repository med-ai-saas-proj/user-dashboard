import { useQuery } from "@tanstack/react-query";
import type { ApiPermissions } from "../services/api-key.dto";
import { getAPIKeyPermissions } from "../services/get-api-key-permissions";

export const useGetApiKeyPermissions = () => {
	return useQuery<ApiPermissions>({
		queryKey: ["api-keys-permissions"],
		queryFn: () => getAPIKeyPermissions(),
	});
};
