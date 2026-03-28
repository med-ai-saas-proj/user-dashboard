import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	OrganizationProject,
	OrganizationProjectsResponse,
} from "@/features/organization/organization.type";

type MockProject = OrganizationProject;

const fallbackOrganizationId = "07fe506a-43ec-46f0-9645-ac3f80e87f85";

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
	const seed = Mock.mock({
		"results|20": [
			{
				id: "@id",
				name: "@title(2,4)",
				description: "@sentence(6,12)",
				archived: false,
			},
		],
	}).results as Array<
		Pick<MockProject, "id" | "name" | "description" | "archived">
	>;

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

const projectsRoute = API_ROUTES.MANAGEMENT.PROJECT;

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
