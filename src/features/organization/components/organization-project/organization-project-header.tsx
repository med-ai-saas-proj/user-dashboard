import { useEffect, useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import { Search } from "lucide-react";
import OrganizationPorjectCreateDialog from "./organization-project-create-dialog";

type OrganizationProjectHeaderProps = {
	setIsArchived: (value: boolean) => void;
};

const OrganizationProjectHeader = ({
	setIsArchived,
}: OrganizationProjectHeaderProps) => {
	const [filterTerm, setFilterTerm] = useState<"active" | "archived">("active");

	useEffect(() => {
		setIsArchived(filterTerm === "archived");
	}, [filterTerm, setIsArchived]);

	return (
		<div className="flex items-center justify-between mb-4 mt-2">
			<div className="flex items-center gap-x-2 w-full">
				<InputGroup className="max-w-xs">
					<InputGroupInput placeholder="Search projects..." />
					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>
				<Select
					value={filterTerm}
					onValueChange={(value) =>
						setFilterTerm(value as "active" | "archived")
					}
				>
					<SelectTrigger className="max-w-sm">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<OrganizationPorjectCreateDialog />
		</div>
	);
};

export default OrganizationProjectHeader;
