import { useMutation } from "@tanstack/react-query";
import { createSetupIntent } from "../../services/organization-billing/create-setup-intent";

export const useCreateSetupIntent = () => {
	return useMutation({
		mutationKey: ["organization-create-setup-intent"],
		mutationFn: createSetupIntent,
		onSuccess: () => {
			console.log("Setup intent created successfully");
		},
		onError: (error) => {
			console.error("Failed to create setup intent:", error);
		},
	});
};
