export type CreateApiKeyRequest = {
	name: string;
	description?: string;
	project_id: string;
	permissions: string[];
};

export type CreateApiKeyResponse = {
	key: string;
	hint: string;
};

export type UpdateApiKeyRequest = {
	apikeyId: string;
	name?: string;
	description?: string;
	permissions?: string[];
};

export type ApiKeyOutput = {
	api_key_uuid: string;
	project_uuid: string;
	name: string;
	description: string;
	hint: string;
	created_at: string;
	permissions: string[];
	disabled: boolean;
};

export type ApiPermissions = {
	total: number;
	results: ApiPermission[];
};

export type ApiPermission = {
	id: string;
	name: string;
	description?: string;
};

export type GetApiKeyResponse = {
	total: number;
	results: ApiKeyOutput[];
};
