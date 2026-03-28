import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type { ProjectRole } from "@/features/project/project.type";

const defaultRoleDescriptionMap: Record<string, string> = {
	owner: "Full control: can manage project settings and members.",
	viewer: "Viewer role for project",
	member: "Can read/write data. No direct member-management controls.",
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

const defaultProjectRoles: ProjectRole[] = [
	{
		id: "role-owner",
		roleName: "Owner",
		description: defaultRoleDescriptionMap.owner,
	},
	{
		id: "role-viewer",
		roleName: "Viewer",
		description: defaultRoleDescriptionMap.viewer,
	},
	{
		id: "role-member",
		roleName: "Member",
		description: defaultRoleDescriptionMap.member,
	},
];

const rolesRoutePattern = new RegExp(
	`^${escapeRegExp(API_ROUTES.MANAGEMENT.PROJECT.PEOPLE)}/[^/]+/roles(?:\\?.*)?$`
);
const roleByIdRoutePattern = new RegExp(
	`^${escapeRegExp(API_ROUTES.MANAGEMENT.PROJECT.PEOPLE)}/[^/]+/roles/[^/]+(?:\\?.*)?$`
);
const mockRoles: ProjectRole[] = [...defaultProjectRoles];

Mock.mock(rolesRoutePattern, "get", () => {
	return [...mockRoles];
});

Mock.mock(rolesRoutePattern, "post", (options) => {
	const body = parseBody(options.body);
	const roleName =
		typeof body?.roleName === "string" ? body.roleName.trim() : "";
	const description =
		typeof body?.description === "string" ? body.description.trim() : "";

	const normalizedRole = roleName.toLowerCase();
	const nextRole: ProjectRole = {
		id: Mock.mock("@id") as string,
		roleName,
		description:
			description ||
			defaultRoleDescriptionMap[normalizedRole] ||
			`No description for ${roleName}.`,
	};

	mockRoles.push(nextRole);

	return nextRole;
});

Mock.mock(roleByIdRoutePattern, "put", (options) => {
	const url = new URL(options.url, "http://dummy");
	const roleId = url.pathname.split("/").at(-1) ?? "";
	const roleIndex = mockRoles.findIndex((item) => item.id === roleId);
	if (roleIndex === -1) {
		return {
			id: roleId,
			roleName: "",
			description: "",
		} satisfies ProjectRole;
	}

	const body = parseBody(options.body);
	const roleName =
		typeof body?.roleName === "string"
			? body.roleName.trim()
			: mockRoles[roleIndex].roleName;
	const description =
		typeof body?.description === "string"
			? body.description.trim()
			: mockRoles[roleIndex].description;

	const updatedRole: ProjectRole = {
		id: roleId,
		roleName,
		description,
	};

	mockRoles[roleIndex] = updatedRole;

	return updatedRole;
});

Mock.mock(roleByIdRoutePattern, "delete", (options) => {
	const url = new URL(options.url, "http://dummy");
	const roleId = url.pathname.split("/").at(-1);

	if (roleId) {
		const roleIndex = mockRoles.findIndex((role) => role.id === roleId);
		if (roleIndex !== -1) {
			mockRoles.splice(roleIndex, 1);
		}
	}

	return {
		success: true,
	};
});
