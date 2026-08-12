import { useCallback, useEffect } from "react";
import { getCreditTransactions } from "../../services/organization-billing/get-credit-transactions";
import { useCreditsStore } from "../../store/credits";

const PAGE_SIZE = 10;

/**
 * Fetches the credit transactions once (on the first visited billing tab) and
 * caches both the positive (credits) and negative (usage) split in the shared
 * store, so the other tab reuses the data without re-fetching.
 */
export const useGetCreditAndUsage = () => {
	const {
		credits,
		usage,
		total,
		hasLoaded,
		isLoading,
		isFetching,
		isError,
		setTransactions,
		setLoading,
		setFetching,
		setError,
	} = useCreditsStore();

	const fetchPage = useCallback(
		async (page: number) => {
			setFetching(true);
			try {
				const response = await getCreditTransactions({
					offset: 0,
					limit: page * PAGE_SIZE,
				});
				setTransactions(response.data, response.total);
			} catch {
				setError(true);
			} finally {
				setFetching(false);
				setLoading(false);
			}
		},
		[setTransactions, setFetching, setLoading, setError]
	);

	useEffect(() => {
		// Only the first visited tab performs the initial fetch.
		if (hasLoaded || isLoading || isFetching || isError) return;

		setLoading(true);
		fetchPage(1);
	}, [hasLoaded, isLoading, isFetching, isError, setLoading, fetchPage]);

	const loadedCount = credits.length + usage.length;

	const loadMore = useCallback(() => {
		if (isFetching) return;
		if (loadedCount >= total) return;

		const nextPage = Math.floor(loadedCount / PAGE_SIZE) + 1;
		fetchPage(nextPage);
	}, [isFetching, loadedCount, total, fetchPage]);

	const hasMore = hasLoaded && loadedCount < total;

	return {
		credits,
		usage,
		total,
		hasLoaded,
		isLoading,
		isFetching,
		isError,
		loadMore,
		hasMore,
	};
};
