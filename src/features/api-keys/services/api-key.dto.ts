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
	permissions?: string[];
};

export type ApiKeyOutput = {
	id: string;
	project_id: string;
	name: string;
	description: string;
	hint: string;
	created_at: string;
	permissions: string[];
	disabled: boolean;
};

export type ApiPermissions = {
	total: number;
	results: string[];
};

export type GetApiKeyResponse = {
	total: number;
	results: ApiKeyOutput[];
};
