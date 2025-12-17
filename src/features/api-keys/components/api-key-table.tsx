import { SquarePen, Trash } from 'lucide-react';
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/table';
import type { APIKey } from '@/features/api-keys/api-key.type';
import { useAPIKeyStore } from '@/features/api-keys/store/api-key.store';
import APIKeyUpdateDialog from './api-key-update-dialog';

const APIKeyTable = ({ apiKeys }: { apiKeys: APIKey[] }) => {
  const deleteAPIKey = useAPIKeyStore((state) => state.deleteAPIKey);
  const [openUpdateAPIKeyDialog, setOpenUpdateAPIKeyDialog] =
    React.useState(false);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);

  const onDeleteApiKey = (apikeyId: string) => {
    deleteAPIKey(apikeyId);
  };

  const onOpenUpdateAPIKeyDialog = (selectedApiKeyId: string) => {
    setOpenUpdateAPIKeyDialog(true);
    setSelectedApiKeyId(selectedApiKeyId);
  };

  const maskKey = (key: string, maskLength = 10): string => {
    if (key.length <= maskLength) return key;

    const visibleStart = key.slice(0, 4);
    const visibleEnd = key.slice(-4);

    const mask = '*'.repeat(maskLength);

    return `${visibleStart}${mask}${visibleEnd}`;
  };

  return (
    <Table className="mt-6">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">NAME</TableHead>
          <TableHead>SECRET KEY</TableHead>
          <TableHead>CREATED</TableHead>
          <TableHead>LAST USED</TableHead>
          <TableHead>CREATED BY</TableHead>
          <TableHead>PERMISSIONS</TableHead>
          <TableHead></TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.map((apiKey) => (
          <TableRow key={apiKey.id}>
            <TableCell className="font-medium">{apiKey.name}</TableCell>
            <TableCell>{maskKey(apiKey.secretKey)}</TableCell>
            <TableCell>{apiKey.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>
              {apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : 'Never'}
            </TableCell>
            <TableCell>{apiKey.createdBy}</TableCell>
            <TableCell>{apiKey.permissions.join(', ')}</TableCell>
            <TableCell>
              <SquarePen
                size={16}
                onClick={() => onOpenUpdateAPIKeyDialog(apiKey.id)}
              />
            </TableCell>
            <TableCell>
              <Trash
                size={16}
                color="#ce4034"
                onClick={() => onDeleteApiKey(apiKey.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {selectedApiKeyId && (
        <APIKeyUpdateDialog
          apikeyId={selectedApiKeyId}
          open={openUpdateAPIKeyDialog}
          onOpenChange={() => setOpenUpdateAPIKeyDialog(false)}
        />
      )}
    </Table>
  );
};

export default APIKeyTable;
