import type React from "react";
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
import { Button } from "@/components/shadcn/button";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/shadcn/spinner";

type ProjectPeopleMemberItemPermissionsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectPermissions: string[] | undefined;
	currentPermissions: Map<string, boolean>;
	isOwner: boolean;
	isPending: boolean;
	onUpdatePermissions: () => void;
	onChangePermission: (perm: string) => void;
};

const ProjectPeopleMemberItemPermissionsDialog: React.FC<
	ProjectPeopleMemberItemPermissionsDialogProps
> = ({
	open,
	onOpenChange,
	projectPermissions,
	currentPermissions,
	isOwner,
	isPending,
	onUpdatePermissions,
	onChangePermission,
}) => {
	const { t } = useTranslation("project");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="default" size="sm" className="ml-auto">
					{t("people.members.item.actions.permissions")}
				</Button>
			</DialogTrigger>
			{open && (
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t("people.members.item.permissionsDialog.title")}
						</DialogTitle>
						<DialogDescription>
							<div className="flex flex-col gap-4 mt-4">
								{projectPermissions?.map((perm) => (
									<div key={perm}>
										<Field orientation="horizontal">
											<Checkbox
												id={perm}
												name={perm}
												checked={
													isOwner || currentPermissions.get(perm) === true
												}
												onCheckedChange={() => onChangePermission(perm)}
												disabled={isOwner || perm.includes("owner")}
											/>
											<Label htmlFor={perm}>{perm}</Label>
										</Field>
										{perm.includes("owner") && !isOwner && (
											<span className="text-xs text-muted-foreground ml-8 mt-1 block">
												{t(
													"people.members.item.permissionsDialog.ownerNotUser"
												)}
											</span>
										)}
									</div>
								))}
							</div>
							{isOwner && (
								<p className="text-sm text-muted-foreground mt-4 text-center">
									{t(
										"people.members.item.permissionsDialog.ownerAllPermissions"
									)}
								</p>
							)}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{t("people.members.item.actions.close")}
							</Button>
						</DialogClose>
						<Button
							variant="default"
							onClick={onUpdatePermissions}
							disabled={isPending}
							className="flex items-center gap-2"
						>
							{isPending && <Spinner />}
							{t("people.members.item.actions.save")}
						</Button>
					</DialogFooter>
				</DialogContent>
			)}
		</Dialog>
	);
};

export default ProjectPeopleMemberItemPermissionsDialog;
