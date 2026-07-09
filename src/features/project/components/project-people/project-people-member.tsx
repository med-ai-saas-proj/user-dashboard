import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { CustomPagination } from "@/components/pagination/pagination";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Spinner } from "@/components/shadcn/spinner";
import { itemVariants } from "@/lib/animations";
import { useGetProjectUsers } from "../../hooks/project-people/use-get-project-users";
import type { ProjectUser } from "../../project.type";
import { useProjectStore } from "../../store/project";
import AddMemberDialog from "./dialog/add-member-dialog";
import ProjectPeopleMemberDetails from "./project-people-member-details";
import ProjectPeopleMemberItem from "./project-people-member-item";
import PermissionDeniedBlock from "@/components/permission-block/permission-denied-block";

const ProjectPeopleMember = () => {
	const params = useParams();
	const projectId =
		useProjectStore((state) => state.projectId) || params.projectId || "";
	const { t } = useTranslation("project");

	const [searchValue, setSearchValue] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const limit = 10;
	const [page, setPage] = useState<number>(1);
	const {
		data: users,
		isPending,
		isError,
	} = useGetProjectUsers({
		projectId,
		offset: (page - 1) * limit,
		limit,
		q: searchQuery || undefined,
	});

	const [openAddMemeberDialog, setOpenAddMemberDialog] =
		useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<ProjectUser | null>(null);

	const handleSearch = () => {
		setPage(1);
		setSearchQuery(searchValue);
	};

	const handleSelectUser = (user: ProjectUser | null) => {
		if (!user) return;
		setSelectedUser(user);
	};

	if (isError) {
		return <PermissionDeniedBlock />;
	}

	return (
		<motion.div variants={itemVariants} initial="hidden" animate="visible">
			<div className="flex items-center justify-between mb-4 mt-2 gap-2">
				<div className="flex items-center gap-2 max-w-sm w-full">
					<InputGroup className="max-w-xs">
						<InputGroupInput
							placeholder={t("people.layout.searchPlaceholder")}
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSearch();
								}
							}}
						/>
						<InputGroupAddon onClick={handleSearch}>
							<Search className="h-4 w-4" />
						</InputGroupAddon>
					</InputGroup>
					<Button variant="default" onClick={handleSearch}>
						{t("people.layout.search")}
					</Button>
				</div>
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
			<div className="flex items-stretch gap-16 min-h-fit">
				<div className="flex-7 flex-col border rounded-md h-fit">
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

				<div className="w-px bg-border" />

				<div className="flex-3">
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
		</motion.div>
	);
};

export default ProjectPeopleMember;
