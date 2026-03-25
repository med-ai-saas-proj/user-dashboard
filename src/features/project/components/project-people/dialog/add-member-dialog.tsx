import { useRef, useState } from "react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/shadcn/tabs";
import AddMemberWithEmailDialog, {
	type AddMemberWithEmailDialogRef,
} from "./add-member-with-email-dialog";
import AddMemberWithoutEmailDialog, {
	type AddMemberWithoutEmailDialogRef,
} from "./add-member-without-email-dialog";
import { DialogClose, DialogFooter } from "@/components/shadcn/dialog";
import { Button } from "@/components/shadcn/button";

type AddMemberDialogProps = {
	openDialog: (success: boolean) => void;
};

const AddMemberDialog = ({ openDialog }: AddMemberDialogProps) => {
	const addMemberWithEmailDialogRef = useRef<AddMemberWithEmailDialogRef>(null);
	const addMemberWithoutEmailDialogRef =
		useRef<AddMemberWithoutEmailDialogRef>(null);

	const [activeTab, setActiveTab] = useState<string>("without-email");

	const handleAddNewMemberForm = async () => {
		let success = false;
		if (activeTab === "with-email" && addMemberWithEmailDialogRef.current) {
			success = await addMemberWithEmailDialogRef.current.submit();
		} else if (
			activeTab === "without-email" &&
			addMemberWithoutEmailDialogRef.current
		) {
			success = await addMemberWithoutEmailDialogRef.current.submit();
		}
		if (success) {
			openDialog(false);
		}
	};

	return (
		<>
			<Tabs
				defaultValue={activeTab}
				onValueChange={setActiveTab}
				className="w-[400px]"
			>
				<TabsList>
					<TabsTrigger value="without-email">Select user</TabsTrigger>
					<TabsTrigger value="with-email">Enter user Email</TabsTrigger>
				</TabsList>
				<TabsContent value="without-email">
					<AddMemberWithoutEmailDialog ref={addMemberWithoutEmailDialogRef} />
				</TabsContent>
				<TabsContent value="with-email">
					<AddMemberWithEmailDialog ref={addMemberWithEmailDialogRef} />
				</TabsContent>
			</Tabs>
			<DialogFooter>
				<DialogClose asChild>
					<Button variant="outline">Close</Button>
				</DialogClose>
				<Button onClick={handleAddNewMemberForm}>Add Member</Button>
			</DialogFooter>
		</>
	);
};

export default AddMemberDialog;
