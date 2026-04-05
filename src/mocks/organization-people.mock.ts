import Mock from "mockjs";
import { API_ROUTES } from "@/config/api-routes";
import type {
	OrganizationInvitationResponse,
	OrganizationPermissions,
	OrganizationUserResponse,
} from "../features/organization/organization.type";
import { useAuthStore } from "@/features/auth/store/auth-store";

type MockUser = OrganizationUserResponse["results"][number];
type MockInvitation = OrganizationInvitationResponse["results"][number];

const organizationId =
	useAuthStore.getState().organization?.id ?? "fake-org-id";
const defaultPermissions = ["read:organization", "write:organization"];

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
		},
	],
}).results;

const mockInvitations: MockInvitation[] = Mock.mock({
	"results|5": [
		{
			id: "@id",
			email: "@email",
			status: "@pick(['pending','accepted','declined'])",
		},
	],
}).results;

const permissionsByUser = new Map<string, string[]>();
for (const user of mockUsers) {
	permissionsByUser.set(user.id, [...defaultPermissions]);
}

const peopleBaseRoute = `${API_ROUTES.MANAGEMENT.ORGANIZATION}/${organizationId}/people`;

const usersRoute = `${peopleBaseRoute}/users`;
const invitationsRoute = `${peopleBaseRoute}/invitations`;

Mock.mock(
	new RegExp(`^${escapeRegExp(usersRoute)}(?:\\?.*)?$`),
	"get",
	(options) => {
		const url = new URL(options.url, "http://dummy");

		const limit = Number(url.searchParams.get("limit")) || 10;
		const offset = Number(url.searchParams.get("offset")) || 0;
		const q = url.searchParams.get("q");

		let filtered = mockUsers;

		// search
		if (q) {
			filtered = mockUsers.filter((user) =>
				user.username.toLowerCase().includes(q.toLowerCase())
			);
		}

		// pagination
		const paginated = filtered.slice(offset, offset + limit);

		const response: OrganizationUserResponse = {
			total: filtered.length,
			results: paginated,
		};

		return response;
	}
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
	new RegExp(`^${escapeRegExp(invitationsRoute)}(?:\\?.*)?$`),
	"get",
	() => ({
		results: mockInvitations,
	})
);

Mock.mock(
	new RegExp(`^${escapeRegExp(invitationsRoute)}(?:\\?.*)?$`),
	"post",
	(options) => {
		const body = parseBody(options.body);
		const email = typeof body?.email === "string" ? body.email : "";

		if (email) {
			const newInvitation: MockInvitation = {
				id: Mock.mock("@id") as string,
				email,
				status: "pending",
			};

			mockInvitations.unshift(newInvitation);
		}

		return {
			success: true,
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(invitationsRoute)}/[^/]+(?:\\?.*)?$`),
	"delete",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const invitationId = url.pathname.split("/").at(-1);

		if (invitationId) {
			const invitationIndex = mockInvitations.findIndex(
				(invitation) => invitation.id === invitationId
			);
			if (invitationIndex !== -1) {
				mockInvitations.splice(invitationIndex, 1);
			}
		}

		return {
			success: true,
		};
	}
);

Mock.mock(
	new RegExp(`^${escapeRegExp(invitationsRoute)}/[^/]+/resend(?:\\?.*)?$`),
	"post",
	(options) => {
		const url = new URL(options.url, "http://dummy");
		const invitationId = url.pathname.split("/").at(-2);

		if (invitationId) {
			const invitation = mockInvitations.find(
				(item) => item.id === invitationId
			);
			if (invitation) {
				invitation.status = "pending";
			}
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
		} satisfies OrganizationPermissions;
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

		if (
			payload &&
			typeof payload === "object" &&
			"permissions" in payload &&
			Array.isArray((payload as { permissions?: unknown }).permissions)
		) {
			nextPermissions = (
				payload as {
					permissions: string[];
				}
			).permissions;
		}

		permissionsByUser.set(userId, nextPermissions);

		return {
			permissions: nextPermissions,
		} satisfies OrganizationPermissions;
	}
);
