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
import { useGetUserPermissions } from "../../hooks/organization-people/use-get-user-permissions";
import { useUpdateUserPermissions } from "../../hooks/organization-people/use-update-user-permissions";
import { EditIcon } from "lucide-react";
import { useGetOrganizationPermissions } from "@/features/organization/hooks/organization-people/use-get-permissions";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { toast } from "sonner";

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
	const { t: tCommon } = useTranslation("common");
	const organizationId = useAuthStore((state) => state.organization?.id) || "";

	const [currentPermissions, setCurrentPermissions] = useState<
		Map<string, boolean>
	>(new Map());
	const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);

	const { mutate: deleteUser } = useDeleteUser();
	const { data: organizationPermissions } = useGetOrganizationPermissions();
	const { data: userPermissions } = useGetUserPermissions({
		organizationId: organizationId,
		userId: id || "",
	});
	const { mutate: updateUserPermissions } = useUpdateUserPermissions();

	const handleRemoveUser = () => {
		deleteUser(
			{
				organizationId: organizationId,
				userId: id,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("requestDone"));
				},
			}
		);
	};
	const handleUpdatePermissions = () => {
		const selectedPermissions = Array.from(currentPermissions.entries())
			.filter(([, isAllowed]) => isAllowed)
			.map(([permission]) => permission);

		updateUserPermissions(
			{
				organizationId: organizationId,
				userId: id,
				permissions: selectedPermissions,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("requestDone"));
				},
			}
		);
	};
	const handleChangePermissions = (perm: string) => {
		setCurrentPermissions((prev) => {
			const next = new Map(prev);
			next.set(perm, !next.get(perm));
			return next;
		});
	};

	useEffect(() => {
		if (!isPermissionsDialogOpen) {
			return;
		}

		const permissionMap = new Map<string, boolean>();

		organizationPermissions?.permissions?.forEach((permission) => {
			permissionMap.set(
				permission,
				userPermissions?.permissions?.includes(permission) ?? false
			);
		});
		setCurrentPermissions(permissionMap);
	}, [organizationPermissions, userPermissions, isPermissionsDialogOpen]);

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
					<div className="flex items-start gap-6">
						<div>
							<p className="font-medium text-nowrap">{username}</p>
							<p className="text-sm text-nowrap text-muted-foreground">
								{email}
							</p>
						</div>
						<div className="flex flex-wrap gap-2 max-w-fit">
							{userPermissions?.permissions.slice(0, 3).map((permission) => (
								<span
									key={permission}
									className="inline-flex items-center rounded-sm bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
								>
									{permission}
								</span>
							))}
							{userPermissions && userPermissions.permissions.length > 3 && (
								<span className="inline-flex items-center rounded-sm bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
									+{userPermissions.permissions.length - 3}
								</span>
							)}
						</div>
					</div>
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
				<Dialog
					open={isPermissionsDialogOpen}
					onOpenChange={setIsPermissionsDialogOpen}
				>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="ml-auto">
							<EditIcon />
							{t("people.members.item.actions.permissions")}
						</Button>
					</DialogTrigger>
					{isPermissionsDialogOpen && (
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{t("people.members.item.permissionsDialog.title")}
								</DialogTitle>
								<DialogDescription>
									<div className="flex flex-col gap-4 mt-4">
										{organizationPermissions?.permissions?.map((perm) => (
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
					)}
				</Dialog>
			</div>
		</div>
	);
};

export default OrganizationPeopleMemberItem;
