import { create } from "zustand";
import type { CreditTransactions } from "../types/billing";

type CreditTransaction = CreditTransactions["data"][number];

interface CreditsState {
	/** Positive credit transactions (top-ups) */
	credits: CreditTransaction[];
	/** Negative credit transactions (usage/spending) */
	usage: CreditTransaction[];
	/** Total number of credit transactions reported by the API */
	total: number;
	/** Whether the first page has been fetched and stored */
	hasLoaded: boolean;
	isLoading: boolean;
	isFetching: boolean;
	isError: boolean;
}

interface CreditsActions {
	setTransactions: (transactions: CreditTransaction[], total: number) => void;
	setLoading: (isLoading: boolean) => void;
	setFetching: (isFetching: boolean) => void;
	setError: (isError: boolean) => void;
	clearCredits: () => void;
}

const splitTransactions = (transactions: CreditTransaction[]) => {
	const credits: CreditTransaction[] = [];
	const usage: CreditTransaction[] = [];

	for (const transaction of transactions) {
		if (Number(transaction.amount) >= 0) {
			credits.push(transaction);
		} else {
			usage.push(transaction);
		}
	}

	return { credits, usage };
};

export const useCreditsStore = create<CreditsState & CreditsActions>()(
	(set) => ({
		credits: [],
		usage: [],
		total: 0,
		hasLoaded: false,
		isLoading: false,
		isFetching: false,
		isError: false,
		setTransactions: (transactions, total) =>
			set(() => {
				const { credits, usage } = splitTransactions(transactions);
				return {
					credits,
					usage,
					total,
					hasLoaded: true,
					isLoading: false,
					isFetching: false,
					isError: false,
				};
			}),
		setLoading: (isLoading) => set({ isLoading }),
		setFetching: (isFetching) => set({ isFetching }),
		setError: (isError) => set({ isError }),
		clearCredits: () =>
			set({
				credits: [],
				usage: [],
				total: 0,
				hasLoaded: false,
				isLoading: false,
				isFetching: false,
				isError: false,
			}),
	})
);
