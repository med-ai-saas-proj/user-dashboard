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
	resetProject: () => void;
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
			resetProject: () =>
				set({
					projectId: "",
					projectInfo: {
						name: "",
						description: undefined,
					},
				}),
		}),
		{
			name: "default-project-information",
		}
	)
);
