import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/shadcn/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/shadcn/input-group";
import { Plus } from "lucide-react";

type OrganizationPeopleLayoutProps = {
	addedButtonText?: string;
	onAdd?: () => void;
	// onSearch: (query: string) => void;
};

const OrganizationPeopleLayout: React.FC<OrganizationPeopleLayoutProps> = ({
	addedButtonText,
	onAdd,
	// onSearch,
}) => {
	const { t } = useTranslation("organization");
	const addButtonText = addedButtonText ?? t("people.layout.addMember");

	return (
		<div className="flex items-center justify-between mb-4 mt-2">
			<InputGroup className="max-w-xs">
				<InputGroupInput placeholder={t("people.layout.searchPlaceholder")} />
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
			</InputGroup>
			<Button variant="default" onClick={onAdd}>
				<Plus />
				{addButtonText}
			</Button>
		</div>
	);
};

export default OrganizationPeopleLayout;
