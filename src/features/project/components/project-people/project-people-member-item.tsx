import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
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
import { useDeleteProjectUser } from "../../hooks/project-people/use-delete-project-user";
import { useProjectStore } from "../../store/project";
import { Field } from "@/components/shadcn/field";
import { Checkbox } from "@/components/shadcn/checkbox";
import { useGetProjectUserPermissions } from "../../hooks/project-people/use-get-project-user-permissions";
import { useUpdateProjectUserPermissions } from "../../hooks/project-people/use-update-project-user-permissions";
import { Label } from "@/components/shadcn/label";
import { useGetProjectPermissions } from "../../hooks/project-people/use-get-project-permissions";

type ProjectPeopleMemberItemProps = React.HTMLAttributes<HTMLDivElement> & {
	id: string;
	username: string;
	email: string;
	imageSrc?: string;
};

const ProjectPeopleMemberItem: React.FC<ProjectPeopleMemberItemProps> = ({
	id,
	username,
	email,
	imageSrc = "",
	...props
}) => {
	const { t } = useTranslation("project");
	const { t: tCommon } = useTranslation("common");
	const params = useParams();
	const projectId =
		useProjectStore((state) => state.projectId) || params.projectId || "";

	const [currentPermissions, setCurrentPermissions] = useState<
		Map<string, boolean>
	>(new Map());
	const [openPermissionDialog, setOpenPermissionDialog] =
		useState<boolean>(false);

	const { mutate: deleteUser } = useDeleteProjectUser();
	const { data: projectPermissionsData } = useGetProjectPermissions();
	const { data: permissionsData } = useGetProjectUserPermissions({
		projectId,
		userId: id,
	});
	const { mutate: updatePermissions } = useUpdateProjectUserPermissions();

	const handleRemoveUser = () => {
		deleteUser(
			{
				projectId,
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

		updatePermissions(
			{
				projectId,
				userId: id,
				permissions: selectedPermissions,
			},
			{
				onSuccess: () => {
					setOpenPermissionDialog(false);
					toast.success(tCommon("requestDone"));

					// optimistic update for permissions
					if (!permissionsData) return;

					const updatedPermissions = new Set(permissionsData.permissions);
					projectPermissionsData?.permissions.forEach((permission) => {
						if (currentPermissions.get(permission)) {
							updatedPermissions.add(permission);
						} else {
							updatedPermissions.delete(permission);
						}
					});
					permissionsData.permissions = Array.from(updatedPermissions);
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
		const permissionsMap = new Map<string, boolean>();
		projectPermissionsData?.permissions.forEach((permission) => {
			permissionsMap.set(
				permission,
				permissionsData?.permissions.includes(permission) || false
			);
		});
		setCurrentPermissions(permissionsMap);
	}, [projectPermissionsData, permissionsData]);

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
						<div className="mt-1">
							<p className="font-medium text-nowrap">{username}</p>
							<p className="text-sm text-nowrap text-muted-foreground">
								{email}
							</p>
						</div>
						<div className="flex flex-wrap gap-2 max-w-fit mt-1">
							{permissionsData?.permissions.slice(0, 3).map((permission) => (
								<span
									key={permission}
									className="inline-flex items-center rounded-sm bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
								>
									{permission}
								</span>
							))}
							{permissionsData && permissionsData.permissions.length > 3 && (
								<span className="inline-flex items-center rounded-sm bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
									+{permissionsData.permissions.length - 3}
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
				<Dialog
					open={openPermissionDialog}
					onOpenChange={setOpenPermissionDialog}
				>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="ml-auto">
							{t("people.members.item.actions.permissions")}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{t("people.members.item.permissionsDialog.title")}
							</DialogTitle>
							<DialogDescription>
								<div className="flex flex-col gap-4 mt-4">
									{projectPermissionsData?.permissions.map((permission) => (
										<Field orientation="horizontal" key={permission}>
											<Checkbox
												id={permission}
												name={permission}
												checked={currentPermissions.get(permission) === true}
												onCheckedChange={() =>
													handleChangePermissions(permission)
												}
											/>

											<Label htmlFor={permission}>{permission}</Label>
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
