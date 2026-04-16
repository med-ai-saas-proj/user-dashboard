import { useQuery } from "@tanstack/react-query";
import { getCreditTransactions } from "../../services/organization-billing/get-credit-transactions";
import type { GetCreditTransactionsParams } from "../../services/organization-billing/get-credit-transactions";

export const useGetCreditTransactions = (
	params?: GetCreditTransactionsParams
) => {
	if (!params)
		params = {
			offset: 0,
			limit: 10,
		};
	if (!params?.limit) params.limit = 10;
	if (!params?.offset) params.offset = 0;

	return useQuery({
		queryKey: ["credit-transactions", params],
		queryFn: () => getCreditTransactions(params),
		enabled: !!params,
		placeholderData: (previousData) => previousData,
	});
};
