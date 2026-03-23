import { CustomPagination } from "@/components/pagination/pagination";
import { Button } from "@/components/shadcn/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Spinner } from "@/components/shadcn/spinner";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetUsers } from "../../hooks/organization-people/use-get-users";
import { useOrganizationStore } from "../../store/organization";
import InvitationDialog from "./invitation-dialog";
import OrganizationPeopleMemberItem from "./organization-people-member-item";

const OrganizationPeopleMember = () => {
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);
	const { t } = useTranslation("organization");

	const limit = 10;
	const [page, setPage] = useState<number>(1);
	const { data: users, isPending } = useGetUsers({
		organizationId: fakeOrgId,
		offset: (page - 1) * limit,
		limit,
	});

	const [openAddMemeberDialog, setOpenAddMemberDialog] =
		useState<boolean>(false);

	return (
		<>
			<div className="flex items-center justify-between mb-4 mt-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder={t("people.layout.searchPlaceholder")} />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Button variant="default" onClick={() => setOpenAddMemberDialog(true)}>
					<Plus />
					{t("people.layout.addMember")}
				</Button>
			</div>
			<InvitationDialog
				open={openAddMemeberDialog}
				onOpenChange={setOpenAddMemberDialog}
			/>
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
			</div>
		</>
	);
};

export default OrganizationPeopleMember;
