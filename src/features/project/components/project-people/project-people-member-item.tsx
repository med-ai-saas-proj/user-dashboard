import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/shadcn/avatar";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";
import { useDeleteUser } from "../../hooks/project-people/use-delete-user";
import { useProjectStore } from "../../store/project";
import { Field } from "@/components/shadcn/field";
import { Checkbox } from "@/components/shadcn/checkbox";
import { useGetPermissions } from "../../hooks/project-people/use-get-permissions";
import { useUpdatePermissions } from "../../hooks/project-people/use-update-permissions";
import { Label } from "@/components/shadcn/label";

type ProjectPeopleMemberItemProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	username: string;
	email: string;
	roles: string[];
	imageSrc?: string;
};

const ProjectPeopleMemberItem: React.FC<ProjectPeopleMemberItemProps> = ({
	id,
	username,
	email,
	roles,
	imageSrc = "",
	...props
}) => {
	const { t } = useTranslation("project");
	const fakeProjectId = useProjectStore((state) => state.projectId);

	const [currentPermissions, setCurrentPermissions] = useState<
		Map<string, boolean>
	>(new Map());
	const [openRoleDialog, setOpenRoleDialog] = useState<boolean>(false);

	const { mutate: deleteUser } = useDeleteUser();
	const { data: permissions } = useGetPermissions({
		projectId: fakeProjectId,
		userId: id,
	});
	const { mutate: updatePermissions } = useUpdatePermissions();

	const handleRemoveUser = () => {
		deleteUser({
			projectId: fakeProjectId,
			userId: id,
		});
	};
	const handleUpdatePermissions = () => {
		const selectedPermissions = Array.from(currentPermissions.entries())
			.filter(([, isAllowed]) => isAllowed)
			.map(([permission]) => permission);

		updatePermissions(
			{
				projectId: fakeProjectId,
				userId: id,
				permissions: selectedPermissions,
			},
			{
				onSuccess: () => {
					setOpenRoleDialog(false);
				},
			}
		);
	};

	const handleChangePermissions = (permission: string) => {
		setCurrentPermissions((prev) => {
			const newMap = new Map(prev);
			const currentValue = newMap.get(permission) || false;
			newMap.set(permission, !currentValue);
			return newMap;
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
					<div className="flex items-center gap-2">
						<p className="font-medium">{username}</p>
						<div className="flex flex-wrap gap-2">
							{roles.map((role) => (
								<span
									key={role}
									className="inline-flex items-center rounded-sm bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
								>
									{role}
								</span>
							))}
						</div>
					</div>
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
								<Trans
									ns="project"
									i18nKey="people.members.item.removeDialog.description"
									values={{ username }}
									components={{ bold: <strong /> }}
								/>
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
				<Dialog open={openRoleDialog} onOpenChange={setOpenRoleDialog}>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="ml-auto">
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

export default ProjectPeopleMemberItem;
