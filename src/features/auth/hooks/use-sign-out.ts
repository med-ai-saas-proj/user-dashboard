import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useIam } from "@/features/auth/providers/iam-provider";

export const useSignOut = () => {
	const { signOut } = useIam();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: async () => {
			await signOut();
			navigate("/login");
		},
	});
};
