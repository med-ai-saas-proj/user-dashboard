import type { APIKey } from '@/features/api-keys/api-key.type';
import type { CreateApiKeyResponse } from '@/features/api-keys/services/api-key.dto';

export const apiKeyMapper = (response: CreateApiKeyResponse): APIKey => {
  return {
    id: '',
    name: '',
    secretKey: response.key,
    createdAt: new Date(),
    lastUsed: null,
    createdBy: '',
    permissions: [],
  };
};
