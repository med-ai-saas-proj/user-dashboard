import { create } from "zustand";

interface ProjectState {
	projectId: string;
	projectInfo: {
		name: string;
		description?: string;
	};
}

interface ProjectActions {
	setProjectId: (id: string) => void;
	setProjectInfo: (info: ProjectState["projectInfo"]) => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
	projectId: "",
	projectInfo: {
		name: "",
		description: undefined,
	},
	setProjectId: (id: string) => set({ projectId: id }),
	setProjectInfo: (info: ProjectState["projectInfo"]) =>
		set({ projectInfo: info }),
}));
