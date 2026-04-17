import { useQuery } from "@tanstack/react-query";
import {
	getTransactionList,
	type GetTransactionListParams,
} from "../../services/organization-billing/get-transaction-list";

export const useGetTransactionList = (params: GetTransactionListParams) => {
	return useQuery({
		queryKey: ["transactionList", params],
		queryFn: () => getTransactionList(params),
		enabled: !!params,
		placeholderData: (previousData) => previousData,
	});
};
