import { create } from 'zustand';
import type { APIKey } from '@/features/api-keys/api-key.type';

interface APIKeyState {
  apiKeys: APIKey[];
}

interface APIKeyActions {
  addAPIKey: (key: Omit<APIKey, 'id' | 'createdAt' | 'lastUsed'>) => void;
  updateAPIKey: (id: string, key: Pick<APIKey, 'name' | 'permissions'>) => void;
  deleteAPIKey: (id: string) => void;
}

type APIKeyStore = APIKeyState & APIKeyActions;

export const useAPIKeyStore = create<APIKeyStore>((set) => ({
  apiKeys: [],

  addAPIKey: (newKeyData) =>
    set((state) => ({
      apiKeys: [
        ...state.apiKeys,
        {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          lastUsed: null,
          ...newKeyData,
        },
      ],
    })),

  updateAPIKey: (id, updatedKey) =>
    set((state) => ({
      apiKeys: state.apiKeys.map((key) =>
        key.id === id ? { ...key, ...updatedKey } : key
      ),
    })),

  deleteAPIKey: (id) =>
    set((state) => ({
      apiKeys: state.apiKeys.filter((key) => key.id !== id),
    })),
}));
