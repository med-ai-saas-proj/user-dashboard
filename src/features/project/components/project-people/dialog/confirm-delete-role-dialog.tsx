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
				},
			}
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Role</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete the role "
						<strong>{roleName}</strong>"?
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</DialogClose>
					<Button
						type="button"
						variant="destructive"
						onClick={handleDeleteRole}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteRoleDialog;
