import axios, { type AxiosError, type AxiosResponse } from "axios";

export interface ApiErrorResponse {
	status: number;
	title: string;
	code: string;
	detail: string;
}

export type ApiError = AxiosError<ApiErrorResponse> & {
	response: AxiosResponse<ApiErrorResponse>;
};

/**
 * Type guard to check if an unknown error is an Axios error
 * containing the expected ApiErrorResponse structure and response.
 */
export const isApiErrorResponse = (error: unknown): error is ApiError => {
	// 1. Confirm it is an Axios error and has a response object
	if (!axios.isAxiosError(error) || !error.response) {
		return false;
	}

	const data = error.response.data;

	// 2. Narrow the data object structure
	return (
		data !== null &&
		typeof data === "object" &&
		"status" in data &&
		"title" in data &&
		"code" in data &&
		"detail" in data
	);
};

/**
 * Safely extracts the error detail message from any error,
 * falling back to a provided translation or default message.
 */
export const getApiErrorMessage = (
	error: unknown,
	fallbackMessage = "An unexpected error occurred"
): string => {
	// Now error is narrowed to ApiError, meaning error.response is guaranteed to be defined
	if (isApiErrorResponse(error)) {
		return error.response.data.detail;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return fallbackMessage;
};
