import { useMutation } from "@tanstack/react-query";

import {
	createOrganization,
	type CreateOrganizationCredentials,
} from "../services/create-organization";

export const useCreateOrganization = () => {
	return useMutation({
		mutationKey: ["createOrganization"],
		mutationFn: (credentials: CreateOrganizationCredentials) =>
			createOrganization(credentials),
	});
}; // create organization hook
