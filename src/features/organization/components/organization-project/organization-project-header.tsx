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
import { useTranslation } from "react-i18next";

type OrganizationProjectHeaderProps = {
	setIsArchived: (value: boolean) => void;
};

const OrganizationProjectHeader = ({
	setIsArchived,
}: OrganizationProjectHeaderProps) => {
	const { t } = useTranslation("organization");
	const [filterTerm, setFilterTerm] = useState<"active" | "archived">("active");

	useEffect(() => {
		setIsArchived(filterTerm === "archived");
	}, [filterTerm, setIsArchived]);

	return (
		<div className="flex items-center justify-between mb-4 mt-2 gap-2">
			<div className="flex items-center gap-x-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput
						placeholder={t("project.header.searchPlaceholder")}
					/>
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
					<SelectTrigger className="w-30">
						<SelectValue placeholder={t("project.header.filterPlaceholder")} />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="active">
								{t("project.header.filterOptions.active")}
							</SelectItem>
							<SelectItem value="archived">
								{t("project.header.filterOptions.archived")}
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
			<OrganizationPorjectCreateDialog />
		</div>
	);
};

export default OrganizationProjectHeader;
