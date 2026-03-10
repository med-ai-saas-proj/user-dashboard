import type {
	OrganizationPermissions,
	OrganizationUserResponse,
} from "../../organization.type";

export const userList = {
	total: 3,
	results: [
		{
			id: "1",
			username: "John Doe",
			email: "john.doe@example.com",
		},
		{
			id: "2",
			username: "Jane Smith",
			email: "jane.smith@example.com",
		},
		{
			id: "3",
			username: "Alice Johnson",
			email: "alice.johnson@example.com",
		},
	],
} satisfies OrganizationUserResponse;

export const userPermissions = {
	permissions: ["read:organization", "write:organization"],
} satisfies OrganizationPermissions;
