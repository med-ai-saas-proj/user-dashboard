import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import { useProjectStore } from "@/features/project/store/project";
import { useDeleteRole } from "@/features/project/hooks/project-people/use-delete-role";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

type ConfirmDeleteRoleDialogProps = {
	roleId: string;
	roleName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const ConfirmDeleteRoleDialog = ({
	roleId,
	roleName,
	open,
	onOpenChange,
}: ConfirmDeleteRoleDialogProps) => {
	const { t } = useTranslation("project");
	const { t: tCommon } = useTranslation("common");
	const fakeProjectId = useProjectStore((state) => state.projectId);

	const { mutate: deleteRole } = useDeleteRole();

	const handleDeleteRole = () => {
		deleteRole(
			{
				projectId: fakeProjectId,
				roleId,
			},
			{
				onSuccess: () => {
					onOpenChange(false);
					toast.success(tCommon("requestDone"));
				},
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("people.role.deleteDialog.title")}</DialogTitle>
					<DialogDescription>
						<Trans
							ns="project"
							i18nKey="people.role.deleteDialog.description"
							values={{ roleName }}
							components={{ bold: <strong /> }}
						/>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{t("people.role.deleteDialog.cancel")}
						</Button>
					</DialogClose>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDeleteRole}
					>
						{t("people.role.deleteDialog.delete")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteRoleDialog;
