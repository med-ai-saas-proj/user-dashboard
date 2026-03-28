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
	organizationId: "07fe506a-43ec-46f0-9645-ac3f80e87f85", // fake organization ID for testing
	setOrganizationId: (id: string) => set({ organizationId: id }),
}));
