import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addCredit,
	type AddCreditRequest,
} from "../../services/organization-billing/add-credit";

export const useAddCredit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["add-credit"],
		mutationFn: (data: AddCreditRequest) => addCredit(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["credits"],
				exact: true,
			});
		},
	});
};
