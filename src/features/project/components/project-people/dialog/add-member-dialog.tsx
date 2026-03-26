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
import { useTranslation } from "react-i18next";

type AddMemberDialogProps = {
	openDialog: (success: boolean) => void;
};

const AddMemberDialog = ({ openDialog }: AddMemberDialogProps) => {
	const { t } = useTranslation("project");
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
					<TabsTrigger value="without-email">
						{t("people.dialog.tabs.selectUser")}
					</TabsTrigger>
					<TabsTrigger value="with-email">
						{t("people.dialog.tabs.enterUserEmail")}
					</TabsTrigger>
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
					<Button variant="outline">{t("people.dialog.actions.close")}</Button>
				</DialogClose>
				<Button onClick={handleAddNewMemberForm}>
					{t("people.dialog.actions.addMember")}
				</Button>
			</DialogFooter>
		</>
	);
};

export default AddMemberDialog;
