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
import { Button } from "@/components/shadcn/button";
import OrganizationPorjectCreateDialog from "./organization-project-create-dialog";
import { useTranslation } from "react-i18next";

type OrganizationProjectHeaderProps = {
	setIsArchived: (value: boolean) => void;
	onSearch: (value: string) => void;
};

const OrganizationProjectHeader = ({
	setIsArchived,
	onSearch,
}: OrganizationProjectHeaderProps) => {
	const { t } = useTranslation("organization");
	const [filterTerm, setFilterTerm] = useState<"active" | "archived">("active");
	const [searchValue, setSearchValue] = useState<string>("");

	useEffect(() => {
		setIsArchived(filterTerm === "archived");
	}, [filterTerm, setIsArchived]);

	const handleSearch = () => {
		onSearch(searchValue);
	};

	return (
		<div className="flex items-center justify-between mb-4 mt-2 gap-2">
			<div className="flex items-center gap-x-2">
				<InputGroup className="max-w-xs">
					<InputGroupInput
						placeholder={t("project.header.searchPlaceholder")}
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
