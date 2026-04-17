import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";
import type { Credits } from "../../types/billing";

export type AddCreditRequest = {
	amount: {
		value: number;
		scale: number;
	};
	description: string;
};

export const addCredit = async (data: AddCreditRequest): Promise<any> => {
	const response = await apiClient.post<Credits>(
		`${API_ROUTES.MANAGEMENT.BILLING}/credits`,
		data
	);
	return response.data;
};
