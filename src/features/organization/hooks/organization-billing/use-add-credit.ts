import { useMutation } from "@tanstack/react-query";
import {
	addCredit,
	type AddCreditRequest,
} from "../../services/organization-billing/add-credit";

export const useAddCredit = () => {
	return useMutation({
		mutationFn: (data: AddCreditRequest) => addCredit(data),
	});
};
