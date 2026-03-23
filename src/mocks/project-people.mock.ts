import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	ProjectPermissions,
	ProjectUserResponse,
} from "@/features/project/project.type";

type MockUser = ProjectUserResponse["results"][number];

const fakeProjectId = "123";
const defaultPermissions = ["read:project", "write:project"];

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

const mockUsers: MockUser[] = Mock.mock({
	"results|50": [
		{
			id: "@id",
			username: "@name",
			email: "@email",
			roles: ["member", "owner"],
		},
	],
}).results;

const peopleBaseRoute = API_ROUTES.MANAGEMENT.PROJECT.PEOPLE.replace(
	":projectId",
	fakeProjectId
);

const userRoute = `${peopleBaseRoute}/user`;
const usersRoute = `${peopleBaseRoute}/users`;
const permissionsByUser = new Map<string, string[]>();
for (const user of mockUsers) {
	permissionsByUser.set(user.id, [...defaultPermissions]);
}

const buildGetUsersHandler = (options: { url: string }) => {
	const url = new URL(options.url, "http://dummy");

	const limit = Number(url.searchParams.get("limit")) || 10;
	const offset = Number(url.searchParams.get("offset")) || 0;
	const q = url.searchParams.get("q");

	let filtered = mockUsers;

	if (q) {
		filtered = mockUsers.filter((user) =>
			user.username.toLowerCase().includes(q.toLowerCase())
		);
	}

	const paginated = filtered.slice(offset, offset + limit);

	const response: ProjectUserResponse = {
		total: filtered.length,
		results: paginated,
	};

	return response;
};

Mock.mock(
	new RegExp(`^${escapeRegExp(userRoute)}(?:\\?.*)?$`),
	"get",
	buildGetUsersHandler
);

Mock.mock(
	new RegExp(`^${escapeRegExp(usersRoute)}(?:\\?.*)?$`),
	"get",
	buildGetUsersHandler
);

Mock.mock(
	new RegExp(`^${escapeRegExp(usersRoute)}/[^/]+(?:\\?.*)?$`),
	"delete",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const userId = url.pathname.split("/").at(-1);

		if (userId) {
			const userIndex = mockUsers.findIndex((user) => user.id === userId);
			if (userIndex !== -1) {
				mockUsers.splice(userIndex, 1);
			}
			permissionsByUser.delete(userId);
		}

		return {
			success: true,
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(usersRoute)}/[^/]+/permissions(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const userId = url.pathname.split("/").at(-2) ?? "";
		const permissions = permissionsByUser.get(userId) ?? defaultPermissions;

		return {
			permissions,
		} satisfies ProjectPermissions;
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(usersRoute)}/[^/]+/permissions(?:\\?.*)?$`),
	"put",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const userId = url.pathname.split("/").at(-2) ?? "";
		const body = parseBody(options.body);
		const payload = body?.permissions;
		let nextPermissions: string[] = [...defaultPermissions];

		if (Array.isArray(payload)) {
			nextPermissions = payload.filter(
				(permission): permission is string => typeof permission === "string"
			);
		}

		permissionsByUser.set(userId, nextPermissions);

		return {
			permissions: nextPermissions,
		} satisfies ProjectPermissions;
	}
);
