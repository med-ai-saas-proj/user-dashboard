export type ProjectPeopleTabs = "members" | "roles";

export type ProjectUser = {
	id: string;
	username: string;
	email: string;
	roles: string[];
};

export type ProjectUserResponse = {
	total: number;
	results: ProjectUser[];
};

export type ProjectRole = {
	id: string;
	roleName: string;
	description: string;
};

export type ProjectPermissions = {
	permissions: string[];
};
