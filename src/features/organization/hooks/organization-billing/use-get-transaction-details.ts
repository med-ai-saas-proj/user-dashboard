import { useQuery } from "@tanstack/react-query";
import { getTransactionDetails } from "../../services/organization-billing/get-transaction-details";

export const useGetTransactionDetails = (transactionUid: string) => {
	return useQuery({
		queryKey: ["transactionDetails", transactionUid],
		queryFn: () => getTransactionDetails(transactionUid),
		enabled: !!transactionUid,
	});
};
