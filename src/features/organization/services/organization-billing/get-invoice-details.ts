import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type {
	InvoiceDetails,
	InvoiceDetailsResponse,
} from "../../types/billing";

export const getInvoiceDetails = async (
	invoiceUID: string
): Promise<InvoiceDetails> => {
	const response = await apiClient.get<InvoiceDetailsResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/invoices/${invoiceUID}`
	);
	return {
		success: response.data.success,
		data: {
			invoiceUID: response.data.data.invoice_uid,
			billingPeriod: response.data.data.billing_period,
			totalAmount: response.data.data.total_amount,
			paidAt: response.data.data.paid_at,
			details: {
				additionalProperty: response.data.data.details.additionalProperty,
			},
			usedCredits: response.data.data.used_credits,
			lineItems: response.data.data.line_items.map((item) => ({
				description: item.description,
				amount: item.amount,
				projectUID: item.project_uid,
			})),
		},
	};
};
