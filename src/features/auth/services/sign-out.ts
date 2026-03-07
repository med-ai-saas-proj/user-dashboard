import { API_ROUTES } from "@/config/api-routes";
import apiClient from "@/query/api-client";

export const signOut = async () => {
	await apiClient.post(API_ROUTES.AUTH.SIGN_OUT);
};
