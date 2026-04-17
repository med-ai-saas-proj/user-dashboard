import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type {
	BillingHistory,
	GetBillingHistoryResponse,
} from "../../types/billing";

export type GetInvoiceParams = {
	paid: boolean;
	from_date?: Date | null;
	to_date?: Date | null;
	limit?: number | null;
	offset?: number | null;
};

export const getInvoices = async (
	params: GetInvoiceParams
): Promise<BillingHistory> => {
	const response = await apiClient.get<GetBillingHistoryResponse>(
		`${API_ROUTES.MANAGEMENT.BILLING}/invoices`,
		{
			params: {
				from_date: params.from_date?.toISOString() || null,
				to_date: params.to_date?.toISOString() || null,
				paid: params.paid,
				limit: params.limit || null,
				offset: params.offset || null,
			},
		}
	);
	return {
		success: response.data.success,
		data: response.data.data.map((item) => ({
			invoiceUID: item.invoice_uid,
			billingPeriod: item.billing_period,
			totalAmount: item.total_amount,
			paidAt: item.paid_at,
			details: {
				additionalProperty: item.details.additionalProperty,
			},
			usedCredits: item.used_credits,
		})),
		total: response.data.total,
		offset: response.data.offset,
		limit: response.data.limit,
	};
};
