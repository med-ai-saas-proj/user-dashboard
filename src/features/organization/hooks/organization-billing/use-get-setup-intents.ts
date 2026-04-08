import { useQuery } from "@tanstack/react-query";
import { getSetupIntents } from "../../services/organization-billing/get-setup-intents";

export const useGetSetupIntents = () => {
	return useQuery({
		queryKey: ["setup-intents"],
		queryFn: getSetupIntents,
	});
};
