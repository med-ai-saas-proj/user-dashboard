import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export type AddCreditRequest = {
	amount: {
		value: number;
		scale: number;
	};
	organization_id: string;
	name: string;
	note: string;
	start_month: number;
	start_year: number;
	exp_month: number;
	exp_year: number;
};

export const addCredit = async (data: AddCreditRequest): Promise<any> => {
	const response = await apiClient.post<any>(
		`${API_ROUTES.MANAGEMENT.BILLING}/credits`,
		data
	);
	return response.data;
};
