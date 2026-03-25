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

type ConfirmDeleteRoleDialogProps = {
	roleName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
};

const ConfirmDeleteRoleDialog = ({
	roleName,
	open,
	onOpenChange,
	onConfirm,
}: ConfirmDeleteRoleDialogProps) => {
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
					<Button type="button" variant="destructive" onClick={onConfirm}>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmDeleteRoleDialog;
