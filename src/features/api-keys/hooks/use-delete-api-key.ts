import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteApiKey } from '@/features/api-keys/services/delete-api-key';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useDeleteApiKey = () => {
	const queryClient = useQueryClient();
	const { t } = useTranslation('api-keys');
	const { t: tCommon } = useTranslation('common');

	return useMutation({
		mutationFn: async (apikeyId: string) => {
			const data = await deleteApiKey(apikeyId);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['api-keys'] });
			toast.success(t('table.successMessages.delete'));
		},
		onError: () => {
			toast.error(tCommon('error'));
		},
	});
};
