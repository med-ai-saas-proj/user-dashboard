export type CreateApiKeyRequest = {
  name: string | null;
  project_id: string;
  permissions: string[];
};
export type CreateApiKeyResponse = {
  key: string;
};

export type UpdateApiKeyRequest = {
  apikeyId: string;
  name?: string;
  permissions?: string[];
};

export type GetApiKeyResponse = {
  id: string;
  secretKey: string;
  name: string | null;
  project_id: string;
  createdAt: string;
  permissions: string[];
}[];
