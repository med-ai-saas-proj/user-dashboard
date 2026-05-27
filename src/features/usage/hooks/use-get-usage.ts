import { useQuery } from "@tanstack/react-query";
import { getUsage } from "@/features/usage/services/get-usage";

export const useGetUsage = () => {
	return useQuery({
		queryKey: ["usage"],
		queryFn: getUsage,
	});
};
