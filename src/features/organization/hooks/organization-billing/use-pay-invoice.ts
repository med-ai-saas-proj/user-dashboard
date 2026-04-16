import { useMutation } from "@tanstack/react-query";
import { payInvoice } from "../../services/organization-billing/pay-invoice";

export const usePayInvoice = () => {
	return useMutation({
		mutationKey: ["pay-invoice"],
		mutationFn: (invoiceUID: string) => payInvoice(invoiceUID),
	});
};
