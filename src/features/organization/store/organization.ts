import { create } from "zustand";

interface OrganizationState {
	organizationId: string;
}

interface OrganizationActions {
	setOrganizationId: (id: string) => void;
}

export const useOrganizationStore = create<
	OrganizationState & OrganizationActions
>((set) => ({
	organizationId: "123", // fake organization ID for testing
	setOrganizationId: (id: string) => set({ organizationId: id }),
}));
