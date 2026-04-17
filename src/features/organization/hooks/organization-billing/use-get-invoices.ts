import { useQuery } from "@tanstack/react-query";
import {
	getInvoices,
	type GetInvoiceParams,
} from "../../services/organization-billing/get-invoices";

export const useGetInvoices = (params: GetInvoiceParams) => {
	return useQuery({
		queryKey: ["invoices", params],
		queryFn: () => getInvoices(params),
		enabled: !!params,
	});
};
