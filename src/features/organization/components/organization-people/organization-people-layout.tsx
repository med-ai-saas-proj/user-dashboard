import { Search } from "lucide-react";
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
	addedButtonText = "Add member",
	onAdd,
	// onSearch,
}) => {
	return (
		<div className="flex items-center justify-between mb-4 mt-2">
			<InputGroup className="max-w-xs">
				<InputGroupInput placeholder="Search..." />
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
			</InputGroup>
			<Button variant="default" onClick={onAdd}>
				<Plus />
				{addedButtonText}
			</Button>
		</div>
	);
};

export default OrganizationPeopleLayout;
