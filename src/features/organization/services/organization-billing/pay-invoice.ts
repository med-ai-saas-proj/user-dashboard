import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { PayInvoiceResponse } from "../../types/billing";

export const payInvoice = async (
	invoiceUID: string
): Promise<PayInvoiceResponse> => {
	const response = await apiClient.post<PayInvoiceResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/invoices/${invoiceUID}/pay`
	);
	return response.data;
};
