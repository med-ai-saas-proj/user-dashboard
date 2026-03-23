import { create } from "zustand";

interface ProjectState {
	projectId: string;
}

interface ProjectActions {
	setProjectId: (id: string) => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
	projectId: "123",
	setProjectId: (id: string) => set({ projectId: id }),
}));
