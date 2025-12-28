import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServiceApiKeyState {
  selectedApiKey: string | null;
  setSelectedApiKey: (key: string | null) => void;
  clearSelectedApiKey: () => void;
}

export const useServiceApiKeyStore = create<ServiceApiKeyState>()(
  persist(
    (set) => ({
      selectedApiKey: null,
      setSelectedApiKey: (key) => set({ selectedApiKey: key }),
      clearSelectedApiKey: () => set({ selectedApiKey: null }),
    }),
    {
      name: 'service-api-key-storage',
    }
  )
);
