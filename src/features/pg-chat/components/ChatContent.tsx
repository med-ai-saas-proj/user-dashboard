import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "../services/chat.dto";
import ChatReceiver from "./ChatReceiver";
import ChatSender from "./ChatSender";

type ChatContentProps = {
	messages: ChatMessage[];
	isLoading?: boolean;
};

const ChatContent = ({ messages, isLoading = false }: ChatContentProps) => {
	const { t } = useTranslation("chatbot");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};
	// biome-ignore lint/correctness/useExhaustiveDependencies: Messages as dependency is intentional to trigger scroll on new message
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	if (messages.length === 0) {
		return (
			<div className="h-full flex items-center justify-center pb-24">
				<div className="text-center text-muted-foreground">
					<p className="text-lg">{t("emptyState.title")}</p>
					<p className="text-sm mt-2">{t("emptyState.subtitle")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full pb-24 overflow-y-hidden">
			<div className="space-y-6">
				{messages.map((message, index) =>
					message.role === "user" ? (
						<ChatSender key={index} message={message.content} />
					) : (
						<div key={index} className="flex items-start space-x-3">
							<ChatReceiver
								key={index}
								message={message.content}
								showCursor={
									// Only show cursor if the stream hasn't started yet
									isLoading &&
									index === messages.length - 1 &&
									message.content === ""
								}
							/>
						</div>
					)
				)}
			</div>

			<div ref={messagesEndRef} />
		</div>
	);
};

export default ChatContent;
