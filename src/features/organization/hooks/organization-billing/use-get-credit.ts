import { useQuery } from "@tanstack/react-query";
import { getCredits } from "../../services/organization-billing/get-credit";

export const useGetCredits = () => {
	return useQuery({
		queryKey: ["credits"],
		queryFn: () => getCredits(),
	});
};
