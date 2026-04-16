import { useQuery } from "@tanstack/react-query";
import { getInvoiceDetails } from "../../services/organization-billing/get-invoice-details";

export const useGetInvoiceDetails = (invoiceUID: string) => {
	return useQuery({
		queryKey: ["invoice-details", invoiceUID],
		queryFn: () => getInvoiceDetails(invoiceUID),
		enabled: !!invoiceUID,
	});
};
