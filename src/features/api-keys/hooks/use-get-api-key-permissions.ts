import { useQuery } from "@tanstack/react-query";
import { getAPIKeyPermissions } from "../services/get-api-key-permissions";
import type { ApiPermissions } from "../services/api-key.dto";

export const useGetApiKeyPermissions = () => {
	return useQuery<ApiPermissions>({
		queryKey: ["api-keys-permissions"],
		queryFn: () => getAPIKeyPermissions(),
	});
};
