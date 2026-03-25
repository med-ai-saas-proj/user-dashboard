import { useState } from "react";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import { useDeleteRole } from "../../hooks/project-people/use-delete-role";
import { useProjectStore } from "../../store/project";
import ConfirmDeleteRoleDialog from "./dialog/confirm-delete-role-dialog";
import { useUpdateRole } from "../../hooks/project-people/use-update-role";

type ProjectPeopleRoleItemDropdownProps = {
	roleId: string;
	roleName: string;
};

const ProjectPeopleRoleItemDropdown = ({
	roleId,
	roleName,
}: ProjectPeopleRoleItemDropdownProps) => {
	const fakeProjectId = useProjectStore((state) => state.projectId);

	const { mutate: deleteRole } = useDeleteRole();
	const { mutate: updateRole } = useUpdateRole();

	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const handleDeleteRole = () => {
		deleteRole({
			projectId: fakeProjectId,
			roleId,
		});
		setOpenDeleteDialog(false);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							size="sm"
							className="w-full flex items-center justify-start gap-x-2"
							onClick={() => setOpenDeleteDialog(true)}
						>
							<SquarePen size={16} className="text-primary" />
							<p className="text-primary">Edit</p>
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							size="sm"
							className="w-full flex items-center justify-start gap-x-2"
							onClick={() => setOpenDeleteDialog(true)}
						>
							<Trash2 size={16} className="text-destructive" />
							<p className="text-destructive">Delete</p>
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDeleteRoleDialog
				roleName={roleName}
				open={openDeleteDialog}
				onOpenChange={setOpenDeleteDialog}
				onConfirm={handleDeleteRole}
			/>
		</>
	);
};

export default ProjectPeopleRoleItemDropdown;
