import { ChevronUp, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@/components/shadcn/input-group";

type ChatInputProps = {
	onSendMessage: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
};

const ChatInput = ({
	onSendMessage,
	isLoading = false,
	placeholder,
}: ChatInputProps) => {
	const { t } = useTranslation("chatbot");

	const [message, setMessage] = useState("");

	const handleSend = () => {
		if (message.trim() && !isLoading) {
			onSendMessage(message);
			setMessage("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="sticky bottom-0 w-full z-50 bg-background pb-4">
			<InputGroup className="w-full mx-auto">
				<InputGroupTextarea
					placeholder={placeholder || t("input.placeholder")}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
				/>
				<InputGroupAddon align="block-end" className="ml-auto w-fit">
					<InputGroupButton
						variant="outline"
						className="rounded-full mr-2"
						size="icon-sm"
						hidden
					>
						<Plus />
					</InputGroupButton>
					<InputGroupButton
						variant="default"
						className="rounded-full ml-auto"
						size="icon-sm"
						onClick={handleSend}
						disabled={!message.trim() || isLoading}
					>
						<ChevronUp />
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
};

export default ChatInput;
