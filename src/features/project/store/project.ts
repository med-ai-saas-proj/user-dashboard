import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useProjectStore = create<ProjectState & ProjectActions>()(
	persist(
		(set) => ({
			projectId: "",
			projectInfo: {
				name: "",
				description: undefined,
			},
			setProjectId: (id: string) => set({ projectId: id }),
			setProjectInfo: (info: ProjectState["projectInfo"]) =>
				set({ projectInfo: info }),
		}),
		{
			name: "default-project-information",
			partialize: (state) => ({
				projectId: state.projectId,
				projectInfo: state.projectInfo,
			}),
		}
	)
);
