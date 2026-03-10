import { useEffect, useState } from "react";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import { useDeleteUser } from "../../hooks/organization-people/use-delete-user";
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
import { useGetPermissions } from "../../hooks/organization-people/use-get-permissions";
import { Field } from "@/components/shadcn/field";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import { useUpdatePermissions } from "../../hooks/organization-people/use-update-permissions";

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
	const fakeOrgId = "123";

	const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);

	const { mutate: deleteUser } = useDeleteUser({
		organizationId: fakeOrgId,
		userId: id,
	});
	const { data: permissions } = useGetPermissions({
		organizationId: fakeOrgId,
		userId: id,
	});
	const { mutate: updatePermissions } = useUpdatePermissions();

	const handleRemoveUser = () => {
		deleteUser();
	};
	const handleUpdatePermissions = () => {
		updatePermissions({
			organizationId: fakeOrgId,
			userId: id,
			permissions: {
				permissions: currentPermissions,
			},
		});
	};
	const handleChangePermissions = (perm: string) => {
		setCurrentPermissions(
			(prev) =>
				prev.includes(perm)
					? prev.filter((p) => p !== perm) // remove
					: [...prev, perm] // add
		);
	};

	useEffect(() => {
		setCurrentPermissions(permissions?.permissions || []);
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
						<Button variant="outline" size="sm" className="ml-auto mt-2">
							Remove
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm removal</DialogTitle>
							<DialogDescription>
								Are you sure you want to remove <strong>{username}</strong> from
								this organization?
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Close
								</Button>
							</DialogClose>
							<Button variant="destructive" onClick={handleRemoveUser}>
								Remove
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="ml-auto mt-2">
							Roles
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Permissions</DialogTitle>
							<DialogDescription>
								<div className="flex flex-col gap-4 mt-4">
									{permissions?.permissions?.map((perm) => (
										<Field orientation={"horizontal"} key={perm}>
											<Checkbox
												id={perm}
												name={perm}
												checked={currentPermissions.includes(perm)}
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
									Close
								</Button>
							</DialogClose>
							<Button variant="default" onClick={handleUpdatePermissions}>
								Save
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default OrganizationPeopleMemberItem;
