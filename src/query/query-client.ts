import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/error";

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
			// Optional: Only show toast for background refetches or when stale data exists
			if (query.state.data !== undefined) {
				toast.error(getApiErrorMessage(error));
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
