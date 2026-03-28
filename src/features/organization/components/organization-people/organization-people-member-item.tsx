import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/shadcn/dialog";
import { Field } from "@/components/shadcn/field";
import { Label } from "@/components/shadcn/label";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDeleteUser } from "../../hooks/organization-people/use-delete-user";
import { useGetPermissions } from "../../hooks/organization-people/use-get-permissions";
import { useUpdatePermissions } from "../../hooks/organization-people/use-update-permissions";
import { useOrganizationStore } from "../../store/organization";
import { EditIcon } from "lucide-react";

type OrganizationPeopleMemberItemProps =
	React.HTMLAttributes<HTMLDivElement> & {
		id: string;
		username: string;
		email: string;
		imageSrc?: string;
	};

const OrganizationPeopleMemberItem: React.FC<
	OrganizationPeopleMemberItemProps
> = ({ id, username, email, imageSrc = "", ...props }) => {
	const { t } = useTranslation("organization");
	const fakeOrgId = useOrganizationStore((state) => state.organizationId);

	const [currentPermissions, setCurrentPermissions] = useState<
		Map<string, boolean>
	>(new Map());

	const { mutate: deleteUser } = useDeleteUser();
	const { data: permissions } = useGetPermissions({
		organizationId: fakeOrgId,
		userId: id,
	});
	const { mutate: updatePermissions } = useUpdatePermissions();

	const handleRemoveUser = () => {
		deleteUser({
			organizationId: fakeOrgId,
			userId: id,
		});
	};
	const handleUpdatePermissions = () => {
		const selectedPermissions = Array.from(currentPermissions.entries())
			.filter(([, isAllowed]) => isAllowed)
			.map(([permission]) => permission);

		updatePermissions({
			organizationId: fakeOrgId,
			userId: id,
			permissions: {
				permissions: selectedPermissions,
			},
		});
	};
	const handleChangePermissions = (perm: string) => {
		setCurrentPermissions((prev) => {
			const next = new Map(prev);
			next.set(perm, !next.get(perm));
			return next;
		});
	};

	useEffect(() => {
		const permissionMap = new Map<string, boolean>();
		permissions?.permissions?.forEach((permission) => {
			permissionMap.set(permission, true);
		});
		setCurrentPermissions(permissionMap);
	}, [permissions]);

	return (
		<div
			className="p-4 border-b last:border-b-0 flex items-center justify-between"
			{...props}
		>
			<div className="flex items-center gap-4 hover:cursor-pointer">
				<Avatar>
					<AvatarImage src={imageSrc} alt={username} />
					<AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
				</Avatar>
				<div>
					<p className="font-medium">{username}</p>
					<p className="text-sm text-muted-foreground">{email}</p>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto">
							{t("people.members.item.actions.remove")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("people.members.item.removeDialog.title")}
							</DialogTitle>
							<DialogDescription>
								{t("people.members.item.removeDialog.description", {
									username,
								})}
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									{t("people.members.item.actions.close")}
								</Button>
							</DialogClose>
							<Button variant="destructive" onClick={handleRemoveUser}>
								{t("people.members.item.actions.remove")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="ml-auto mt-2">
							<EditIcon />
							{t("people.members.item.actions.roles")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("people.members.item.permissionsDialog.title")}
							</DialogTitle>
							<DialogDescription>
								<div className="flex flex-col gap-4 mt-4">
									{permissions?.permissions?.map((perm) => (
										<Field orientation={"horizontal"} key={perm}>
											<Checkbox
												id={perm}
												name={perm}
												checked={currentPermissions.get(perm) === true}
												onCheckedChange={() => handleChangePermissions(perm)}
											/>
											<Label htmlFor={perm}>{perm}</Label>
										</Field>
									))}
								</div>
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									{t("people.members.item.actions.close")}
								</Button>
							</DialogClose>
							<Button variant="default" onClick={handleUpdatePermissions}>
								{t("people.members.item.actions.save")}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default OrganizationPeopleMemberItem;
