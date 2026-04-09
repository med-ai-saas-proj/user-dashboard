import { useQuery } from "@tanstack/react-query";
import {
	getCredits,
	type GetCreditParams,
} from "../../services/organization-billing/get-credit";

export const useGetCredits = (params: GetCreditParams) => {
	return useQuery({
		queryKey: ["credits", params],
		queryFn: () => getCredits(params),
		enabled: !!params,
	});
};
