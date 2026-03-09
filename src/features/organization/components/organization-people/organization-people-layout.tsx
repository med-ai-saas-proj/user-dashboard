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
	children: React.ReactNode;
};

const OrganizationPeopleLayout: React.FC<OrganizationPeopleLayoutProps> = ({
	addedButtonText = "Add member",
	children,
}) => {
	return (
		<div>
			<div className="flex items-center justify-between my-4">
				<div>
					<InputGroup className="max-w-xs">
						<InputGroupInput placeholder="Search..." />
						<InputGroupAddon>
							<Search />
						</InputGroupAddon>
					</InputGroup>
				</div>
				<div>
					<Button variant="default">
						<Plus />
						{addedButtonText}
					</Button>
				</div>
			</div>
			<div>{children}</div>
		</div>
	);
};

export default OrganizationPeopleLayout;
