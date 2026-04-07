import { useQuery } from "@tanstack/react-query";
import { getBillingSource } from "../../services/organization-billing/get-billing-source";

export const useGetBillingSource = () => {
	return useQuery({
		queryKey: ["organization-billing-source"],
		queryFn: getBillingSource,
	});
};
