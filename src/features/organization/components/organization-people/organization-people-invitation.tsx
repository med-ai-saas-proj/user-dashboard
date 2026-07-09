import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";
import { useGetInvitations } from "../../hooks/organization-people/use-get-invitations";
import OrganizationPeopleInvitationItem from "./organization-people-invitation-item";
import InvitationDialog from "./invitation-dialog";
import { Button } from "@/components/shadcn/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Plus, Search } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { motion } from "framer-motion";
import { itemVariants } from "@/lib/animations";
import PermissionDeniedBlock from "@/components/permission-block/permission-denied-block";

const OrganizationPeopleInvitation = () => {
	const { t } = useTranslation("organization");
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const [openInviteDialog, setOpenInviteDialog] = useState<boolean>(false);

	const {
		data: invitations,
		isPending,
		isError,
	} = useGetInvitations({
		organizationId,
	});

	if (isError) {
		return <PermissionDeniedBlock />;
	}

	return (
		<motion.div initial="hidden" animate="visible" variants={itemVariants}>
			<div className="flex items-center justify-between mb-4 mt-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder={t("people.layout.searchPlaceholder")} />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Button variant="default" onClick={() => setOpenInviteDialog(true)}>
					<Plus />
					{t("people.layout.inviteMember")}
				</Button>
			</div>
			<InvitationDialog
				open={openInviteDialog}
				onOpenChange={setOpenInviteDialog}
			/>
			<div
				className={cn("border rounded-md min-h-fit", {
					"p-4": isPending,
				})}
			>
				{isPending && (
					<div className="flex items-center justify-center h-full">
						<div className="flex items-center justify-center gap-2">
							<Spinner />
							<p className="text-center text-sm text-muted-foreground">
								{t("people.invitations.loading")}
							</p>
						</div>
					</div>
				)}
				{!isPending &&
					invitations?.results.map((invitation) => (
						<OrganizationPeopleInvitationItem
							key={invitation.id}
							invitation={invitation}
						/>
					))}
				{!isPending && !invitations?.results.length && (
					<div className="py-8">
						<p className="text-center text-sm text-muted-foreground">
							{t("people.invitations.noInvitations")}
						</p>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default OrganizationPeopleInvitation;
