import { useQuery } from "@tanstack/react-query";

import { getAvailableApiReferenceServices } from "../services/get-api-reference";

export const useApiReference = () => {
	return useQuery({
		queryKey: ["api-reference", "available-services"],
		queryFn: getAvailableApiReferenceServices,
	});
};
