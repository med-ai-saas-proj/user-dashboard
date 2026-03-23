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

export type ProjectPermissions = {
	permissions: string[];
};
