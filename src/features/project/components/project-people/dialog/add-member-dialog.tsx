import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";
import AddMemberWithEmailDialog from "./add-member-with-email-dialog";
import AddMemberWithoutEmailDialog from "./add-member-without-email-dialog";

const AddMemberDialog = () => {
	return (
		<Tabs defaultValue="without-email" className="w-[400px]">
			<TabsList>
				<TabsTrigger value="without-email">Select user</TabsTrigger>
				<TabsTrigger value="with-email">Enter user Email</TabsTrigger>
			</TabsList>
			<TabsContent value="without-email">
				<AddMemberWithoutEmailDialog />
			</TabsContent>
			<TabsContent value="with-email">
				<AddMemberWithEmailDialog />
			</TabsContent>
		</Tabs>
	);
};

export default AddMemberDialog;
