import { useMutation } from "@tanstack/react-query";
import { enableApiKey } from "../services/enable-api-key";

export const useEnableApiKey = () => {
	return useMutation({
		mutationFn: (apiKeyId: string) => enableApiKey(apiKeyId),
	});
};
