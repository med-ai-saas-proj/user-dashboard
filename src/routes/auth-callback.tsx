import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIam } from "@/features/auth/providers/iam-provider";

const AuthCallbackPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { markAuthenticated } = useIam();

	useEffect(() => {
		const raw = searchParams.get("accessTokenPayload");
		let payload: Record<string, unknown> | null = null;
		if (raw) {
			try {
				payload = JSON.parse(raw);
			} catch {
				payload = null;
			}
		}
		markAuthenticated(payload as never);
		navigate("/", { replace: true });
	}, [markAuthenticated, navigate, searchParams]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
				<p className="mt-4 text-muted-foreground">Signing you in…</p>
			</div>
		</div>
	);
};

export default AuthCallbackPage;
