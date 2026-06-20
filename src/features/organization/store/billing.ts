import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BillingState {
	billingSourceId: string | null;
	defaultPaymentMethodId: string | null;
}

interface BillingActions {
	setBillingSourceId: (id: string | null) => void;
	setDefaultPaymentMethodId: (id: string | null) => void;
	clearBilling: () => void;
}

export const useBillingStore = create<BillingState & BillingActions>()(
	persist(
		(set) => ({
			billingSourceId: null,
			defaultPaymentMethodId: null,
			setBillingSourceId: (id) => set({ billingSourceId: id }),
			setDefaultPaymentMethodId: (id) => set({ defaultPaymentMethodId: id }),
			clearBilling: () =>
				set({ billingSourceId: null, defaultPaymentMethodId: null }),
		}),
		{
			name: "billing-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
