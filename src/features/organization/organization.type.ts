export type OrganizationPeopleTabs = "members" | "invitations" | "roles";

export type OrganizationUser = {
	id: string;
	username: string;
	email: string;
};

export type OrganizationUserResponse = {
	total: number;
	results: OrganizationUser[];
};

export type OrganizationInvitation = {
	id: string;
	email: string;
	status: "pending" | "accepted" | "declined";
};

export type OrganizationInvitationResponse = {
	results: OrganizationInvitation[];
};

export type OrganizationPermissions = {
	permissions: string[];
};

export type OrganizationProject = {
	id: string;
	name: string;
	description: string;
	organization_id: string;
	archived: boolean;
};

export type OrganizationProjectsResponse = {
	total: number;
	results: OrganizationProject[];
};
