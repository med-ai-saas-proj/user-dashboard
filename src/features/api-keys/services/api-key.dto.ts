export type CreateApiKeyRequest = {
  name: string | null;
  project_id: string;
  permissions: string[];
};
export type CreateApiKeyResponse = {
  key: string;
};

export interface UpdateApiKeyRequest {
  apikeyId: string;
  name?: string;
  permissions?: string[];
}
