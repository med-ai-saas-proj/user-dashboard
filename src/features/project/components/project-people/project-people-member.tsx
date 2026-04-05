import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../store/project";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Button } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { Plus, Search } from "lucide-react";
import { useGetProjectUsers } from "../../hooks/project-people/use-get-project-users";
import type { ProjectUser } from "../../project.type";
import { CustomPagination } from "@/components/pagination/pagination";
import ProjectPeopleMemberItem from "./project-people-member-item";
import ProjectPeopleMemberDetails from "./project-people-member-details";
import AddMemberDialog from "./dialog/add-member-dialog";

const ProjectPeopleMember = () => {
	const params = useParams();
	const projectId =
		useProjectStore((state) => state.projectId) || params.projectId || "";
	const { t } = useTranslation("project");

	const limit = 10;
	const [page, setPage] = useState<number>(1);
	const { data: users, isPending } = useGetProjectUsers({
		projectId,
		offset: (page - 1) * limit,
		limit,
	});

	const [openAddMemeberDialog, setOpenAddMemberDialog] =
		useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<ProjectUser | null>(null);

	const handleSelectUser = (user: ProjectUser | null) => {
		if (!user) return;
		setSelectedUser(user);
	};

	return (
		<>
			<div className="flex items-center justify-between mb-4 mt-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder={t("people.layout.searchPlaceholder")} />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Dialog
					open={openAddMemeberDialog}
					onOpenChange={setOpenAddMemberDialog}
				>
					<DialogTrigger asChild>
						<Button
							variant="default"
							onClick={() => setOpenAddMemberDialog(true)}
						>
							<Plus />
							{t("people.layout.addMember")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("people.dialog.title")}</DialogTitle>
						</DialogHeader>
						<AddMemberDialog
							openDialog={(success) => setOpenAddMemberDialog(success)}
						/>
					</DialogContent>
				</Dialog>
			</div>
			<div className="flex gap-8">
				<div className="flex-7 flex-col border rounded-md">
					{isPending && (
						<div className="flex items-center justify-center h-full">
							<div className="flex items-center justify-center gap-2">
								<Spinner />
								<p className="text-center text-sm text-muted-foreground">
									{t("people.members.loading")}
								</p>
							</div>
						</div>
					)}
					{!isPending &&
						users?.results.map((user) => (
							<ProjectPeopleMemberItem
								key={user.id}
								id={user.id}
								username={user.username}
								email={user.email}
								onClick={() => handleSelectUser(user)}
							/>
						))}
					<CustomPagination
						className="my-4"
						currentPage={page}
						limit={limit}
						totalElements={users?.total || 1}
						onPageChange={setPage}
					/>
				</div>
				<div className="flex-3 border-l p-8">
					{!selectedUser && (
						<div className="flex items-center justify-center h-full">
							<p className="text-center text-muted-foreground">
								{t("people.members.emptySelection")}
							</p>
						</div>
					)}
					{selectedUser && <ProjectPeopleMemberDetails user={selectedUser} />}
				</div>
			</div>
		</>
	);
};

export default ProjectPeopleMember;
