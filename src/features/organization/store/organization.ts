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
	organizationId: "33104fd0-9da3-4403-a3cf-40614acf98bc", // fake organization ID for testing
	setOrganizationId: (id: string) => set({ organizationId: id }),
}));
