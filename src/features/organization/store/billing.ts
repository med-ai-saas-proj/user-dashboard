import { create } from "zustand";

interface BillingState {
	billingSourceId: string | null;
}

interface BillingActions {
	setBillingSourceId: (id: string | null) => void;
}

export const useBillingStore = create<BillingState & BillingActions>((set) => ({
	billingSourceId: null,
	setBillingSourceId: (id: string | null) => set({ billingSourceId: id }),
}));
