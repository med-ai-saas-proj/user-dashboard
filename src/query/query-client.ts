import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage, isApiErrorResponse } from "@/lib/error";

export const query_client = new QueryClient({
	// TODO: Set using ENV for dev and production values
	defaultOptions: {
		queries: {
			retry: 0,
			refetchOnWindowFocus: false,
			staleTime: 0,
		},
	},
	// Automatically handle all Query errors
	queryCache: new QueryCache({
		onError: (error, query) => {
			if (isApiErrorResponse(error)) {
				const isPermissionError = error.response.data.status === 403;
				// Always notify for permission/forbidden errors, OR for background failures
				if (isPermissionError || query.state.data !== undefined) {
					toast.error(
						isPermissionError
							? error.response.data.detail ||
									"You do not have permission to perform this action."
							: getApiErrorMessage(error)
					);
				}
			}
		},
	}),
	// Automatically handle all Mutation errors (POST, PUT, DELETE, etc.)
	mutationCache: new MutationCache({
		onError: (error) => {
			toast.error(getApiErrorMessage(error));
		},
	}),
});
