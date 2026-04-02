import { useMutation } from "@tanstack/react-query";
import { disableApiKey } from "../services/disable-api-key";

export const useDisableApiKey = () => {
	return useMutation({
		mutationFn: (apiKeyId: string) => disableApiKey(apiKeyId),
	});
};
