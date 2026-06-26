import { useMediaQuery } from "@mantine/hooks";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomPagination } from "@/components/pagination/pagination";
import { Button } from "@/components/shadcn/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Spinner } from "@/components/shadcn/spinner";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { itemVariants } from "@/lib/animations";
import { useGetUsers } from "../../hooks/organization-people/use-get-users";
import type { OrganizationUser } from "../../organization.type";
import InvitationDialog from "./invitation-dialog";
import OrganizationPeopleMemberDetails from "./organization-people-member-details";
import OrganizationPeopleMemberItem from "./organization-people-member-item";

const OrganizationPeopleMember = () => {
	const organizationId = useAuthStore((state) => state.organization?.id) || "";
	const { t } = useTranslation("organization");

	const [searchValue, setSearchValue] = useState<string>("");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const limit = 10;
	const [page, setPage] = useState<number>(1);
	const { data: users, isPending } = useGetUsers({
		organizationId,
		offset: (page - 1) * limit,
		limit,
		q: searchQuery || undefined,
	});

	const [openAddMemeberDialog, setOpenAddMemberDialog] =
		useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(
		null
	);
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 768px)");

	const handleSearch = () => {
		setPage(1);
		setSearchQuery(searchValue);
	};

	const handleSelectUser = (user: OrganizationUser) => {
		if (!user) return;
		setSelectedUser(user);
		if (isMobile) {
			setIsDetailsDialogOpen(true);
		}
	};

	const handleDialogClose = (open: boolean) => {
		setIsDetailsDialogOpen(open);
		if (!open) {
			setSelectedUser(null);
		}
	};

	return (
		<motion.div initial="hidden" animate="visible" variants={itemVariants}>
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
				<Button variant="default" onClick={() => setOpenAddMemberDialog(true)}>
					<Plus />
					{t("people.layout.addMember")}
				</Button>
			</div>
			<InvitationDialog
				open={openAddMemeberDialog}
				onOpenChange={setOpenAddMemberDialog}
			/>
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
							<OrganizationPeopleMemberItem
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

				{!isMobile && (
					<div className="flex-3 hidden md:block">
						{!selectedUser && (
							<div className="flex items-center justify-center h-full">
								<p className="text-center text-muted-foreground">
									{t("people.members.emptySelection")}
								</p>
							</div>
						)}
						{selectedUser && (
							<OrganizationPeopleMemberDetails user={selectedUser} />
						)}
					</div>
				)}
			</div>
			{isMobile && selectedUser && (
				<OrganizationPeopleMemberDetails
					user={selectedUser}
					isDialog
					open={isDetailsDialogOpen}
					onOpenChange={handleDialogClose}
				/>
			)}
		</motion.div>
	);
};

export default OrganizationPeopleMember;
