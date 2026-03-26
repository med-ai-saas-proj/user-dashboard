import { useState } from "react";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Button } from "@/components/shadcn/button";
import ConfirmDeleteRoleDialog from "./dialog/confirm-delete-role-dialog";
import RoleDialog from "./dialog/role-dialog";

type ProjectPeopleRoleItemDropdownProps = {
	roleId: string;
	roleName: string;
	roleDescription: string;
};

const ProjectPeopleRoleItemDropdown = ({
	roleId,
	roleName,
	roleDescription,
}: ProjectPeopleRoleItemDropdownProps) => {
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm">
						<MoreHorizontal />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onSelect={() => setOpenEditDialog(true)}>
						<div className="w-full flex items-center justify-start gap-x-2">
							<SquarePen size={16} className="text-primary" />
							<p className="text-primary">Edit</p>
						</div>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpenDeleteDialog(true)}>
						<div className="w-full flex items-center justify-start gap-x-2">
							<Trash2 size={16} className="text-destructive" />
							<p className="text-destructive">Delete</p>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDeleteRoleDialog
				roleId={roleId}
				roleName={roleName}
				open={openDeleteDialog}
				onOpenChange={setOpenDeleteDialog}
			/>
			<RoleDialog
				mode="edit"
				roleId={roleId}
				roleName={roleName}
				roleDescription={roleDescription}
				open={openEditDialog}
				onOpenChange={setOpenEditDialog}
			/>
		</>
	);
};

export default ProjectPeopleRoleItemDropdown;
