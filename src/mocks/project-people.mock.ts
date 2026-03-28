import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	ProjectRole,
	ProjectPermissions,
	ProjectUserResponse,
} from "@/features/project/project.type";

type MockUser = ProjectUserResponse["results"][number];

const defaultPermissions = ["read:project", "write:project"];

const roleDescriptionMap: Record<string, string> = {
	owner: "Owner can manage project settings, members, roles, and permissions.",
	viewer: "Viewer can view project data but cannot make changes.",
	member: "Member can collaborate on project work with standard access.",
};

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

const peopleBaseRoute = API_ROUTES.MANAGEMENT.PROJECT;
const usersRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/[^/]+/users(?:\\?.*)?$`
);
const userRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/[^/]+/user(?:\\?.*)?$`
);
const userByIdRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/[^/]+/users/[^/]+(?:\\?.*)?$`
);
const userRolesRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/[^/]+/users/[^/]+/roles(?:\\?.*)?$`
);
const userPermissionsRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/[^/]+/users/[^/]+/permissions(?:\\?.*)?$`
);
const permissionsRoutePattern = new RegExp(
	`^${escapeRegExp(peopleBaseRoute)}/permissions(?:\\?.*)?$`
);
const permissionsByUser = new Map<string, string[]>();
const rolesByUser = new Map<string, string[]>();
for (const user of mockUsers) {
	permissionsByUser.set(user.id, [...defaultPermissions]);
	rolesByUser.set(user.id, [...user.roles]);
}

const toProjectRoles = (roles: string[]): ProjectRole[] =>
	roles.map((role) => ({
		id: role,
		roleName: role,
		description:
			roleDescriptionMap[role.toLowerCase()] ?? `No description for ${role}.`,
	}));

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

Mock.mock(usersRoutePattern, "post", (options) => {
	const body = parseBody(options.body);
	const userId = typeof body?.userId === "string" ? body.userId : "";

	if (!userId) {
		const response: ProjectUserResponse = {
			total: mockUsers.length,
			results: [...mockUsers],
		};

		return response;
	}

	let existingUser = mockUsers.find((user) => user.id === userId);

	if (!existingUser) {
		existingUser = {
			id: userId,
			username: `user-${userId.slice(0, 8)}`,
			email: `${userId.slice(0, 8)}@example.com`,
			roles: ["member"],
		};
		mockUsers.unshift(existingUser);
	}

	rolesByUser.set(userId, [...existingUser.roles]);
	permissionsByUser.set(userId, [...defaultPermissions]);

	const response: ProjectUserResponse = {
		total: mockUsers.length,
		results: [...mockUsers],
	};

	return response;
});

Mock.mock(userRoutePattern, "get", buildGetUsersHandler);

Mock.mock(usersRoutePattern, "get", buildGetUsersHandler);

Mock.mock(userByIdRoutePattern, "delete", (options) => {
	const url = new URL(options.url, "http://dummy");
	const userId = url.pathname.split("/").at(-1);

	if (userId) {
		const userIndex = mockUsers.findIndex((user) => user.id === userId);
		if (userIndex !== -1) {
			mockUsers.splice(userIndex, 1);
		}
		permissionsByUser.delete(userId);
		rolesByUser.delete(userId);
	}

	return {
		success: true,
	};
});

Mock.mock(userRolesRoutePattern, "get", (options) => {
	const url = new URL(options.url, "http://dummy");
	const userId = url.pathname.split("/").at(-2) ?? "";
	const roles = rolesByUser.get(userId) ?? ["member"];

	return toProjectRoles(roles);
});

Mock.mock(userRolesRoutePattern, "put", (options) => {
	const url = new URL(options.url, "http://dummy");
	const userId = url.pathname.split("/").at(-2) ?? "";
	const body = parseBody(options.body);
	const payload = body?.roles;
	let nextRoles: string[] = ["member"];

	if (Array.isArray(payload)) {
		nextRoles = payload.filter(
			(role): role is string => typeof role === "string"
		);
	}

	rolesByUser.set(userId, nextRoles);

	const user = mockUsers.find((item) => item.id === userId);
	if (user) {
		user.roles = [...nextRoles];
	}

	return toProjectRoles(nextRoles);
});

Mock.mock(permissionsRoutePattern, "get", () => {
	return {
		permissions: [...defaultPermissions],
	} satisfies ProjectPermissions;
});

Mock.mock(userPermissionsRoutePattern, "get", (options) => {
	const url = new URL(options.url, "http://dummy");
	const userId = url.pathname.split("/").at(-2) ?? "";
	const permissions = permissionsByUser.get(userId) ?? defaultPermissions;

	return {
		permissions,
	} satisfies ProjectPermissions;
});

Mock.mock(userPermissionsRoutePattern, "put", (options) => {
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
});
