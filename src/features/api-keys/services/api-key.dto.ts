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
	name: string;
	description: string;
	hint: string;
	created_at: string;
	permissions: string[];
};

export type GetApiKeyResponse = ApiKeyOutput[];
