import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	OrganizationProject,
	OrganizationProjectArchive,
	OrganizationProjectsResponse,
} from "@/features/organization/organization.type";
import { useOrganizationStore } from "@/features/organization/store/organization";

type MockProject = OrganizationProject;

const fallbackOrganizationId = useOrganizationStore.getState().organizationId;

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBody = (body?: string) => {
	if (!body) {
		return null;
	}

	try {
		return JSON.parse(body) as Record<string, unknown>;
	} catch {
		return null;
	}
};

const buildMockProjects = (organizationId: string) => {
	const defaultProjectIds = ["project-alpha", "project-beta", "project-gamma"];

	const seed = Mock.mock({
		"results|40": [
			{
				id: "@id",
				name: "@title(2,4)",
				description: "@sentence(6,12)",
				archived: "@boolean(30, 70, true)", // 30% chance to be archived, 70% chance to be active
			},
		],
	}).results as Array<
		Pick<MockProject, "id" | "name" | "description" | "archived">
	>;

	defaultProjectIds.forEach((projectId, index) => {
		if (seed[index]) {
			seed[index].id = projectId;
		}
	});

	return seed.map((project) => ({
		...project,
		organization_id: organizationId,
	}));
};

const projectsByOrganization = new Map<string, MockProject[]>();

const getProjects = (organizationId: string) => {
	if (!projectsByOrganization.has(organizationId)) {
		projectsByOrganization.set(
			organizationId,
			buildMockProjects(organizationId)
		);
	}

	return projectsByOrganization.get(organizationId) ?? [];
};

const findProjectById = (projectId: string) => {
	for (const projects of projectsByOrganization.values()) {
		const project = projects.find((item) => item.id === projectId);
		if (project) {
			return project;
		}
	}

	return null;
};

const buildArchiveResponse = (
	projectId: string,
	archived: boolean
): OrganizationProjectArchive => ({
	project_id: projectId,
	archived,
});

const projectsRoute = API_ROUTES.MANAGEMENT.PROJECT;

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}/([^/]+)(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const [, projectId = ""] =
			url.pathname.match(
				new RegExp(`${new URL(projectsRoute).pathname}/([^/]+)$`)
			) ?? [];

		const project =
			findProjectById(projectId) ||
			getProjects(fallbackOrganizationId).find(
				(item) => item.id === projectId
			) ||
			null;

		if (!project) {
			return null;
		}

		// Keep both snake_case and camelCase keys for compatibility across callers.
		return {
			id: project.id,
			organization_id: project.organization_id,
			archived: project.archived,
			name: project.name,
			description: project.description,
			project_name: project.name,
			project_description: project.description,
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");

		const organizationId =
			url.searchParams.get("organization") ?? fallbackOrganizationId;
		const limit = Number(url.searchParams.get("limit")) || 10;
		const offset = Number(url.searchParams.get("offset")) || 0;
		const q = url.searchParams.get("q")?.toLowerCase();

		const projects = getProjects(organizationId);
		const filteredProjects = q
			? projects.filter(
					(project) =>
						project.name.toLowerCase().includes(q) ||
						project.description.toLowerCase().includes(q)
				)
			: projects;

		const response: OrganizationProjectsResponse = {
			total: filteredProjects.length,
			results: filteredProjects.slice(offset, offset + limit),
		};

		return response;
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}/([^/]+)/archive(?:\\?.*)?$`),
	"post",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const [, projectId = ""] =
			url.pathname.match(
				new RegExp(`${new URL(projectsRoute).pathname}/([^/]+)/archive$`)
			) ?? [];

		const project = findProjectById(projectId);
		if (project) {
			project.archived = true;
		}

		return buildArchiveResponse(projectId, true);
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}/([^/]+)/unarchive(?:\\?.*)?$`),
	"post",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const [, projectId = ""] =
			url.pathname.match(
				new RegExp(`${new URL(projectsRoute).pathname}/([^/]+)/unarchive$`)
			) ?? [];

		const project = findProjectById(projectId);
		if (project) {
			project.archived = false;
		}

		return buildArchiveResponse(projectId, false);
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(projectsRoute)}(?:\\?.*)?$`),
	"post",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const body = parseBody(options.body);

		const organizationId =
			url.searchParams.get("organization") ?? fallbackOrganizationId;
		const projectName =
			typeof body?.name === "string" && body.name.trim().length > 0
				? body.name.trim()
				: "Untitled Project";
		const projectDescription =
			typeof body?.description === "string" ? body.description.trim() : "";

		const createdProject: OrganizationProject = {
			id: Mock.mock("@id") as string,
			name: projectName,
			description: projectDescription,
			organization_id: organizationId,
			archived: false,
		};

		const projects = getProjects(organizationId);
		projects.unshift(createdProject);

		return createdProject;
	}
);
