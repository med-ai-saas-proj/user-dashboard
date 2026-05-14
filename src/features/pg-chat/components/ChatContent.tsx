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
	const scrollRef = useRef<HTMLDivElement>(null);

	// Scroll the chat panel itself (not the whole window) so the page above
	// the chat stays put while new turns stream in. Depend on length + last
	// content so it also fires on streaming deltas.
	const messageCount = messages.length;
	const lastContent = messages[messages.length - 1]?.content ?? "";
	useEffect(() => {
		const el = scrollRef.current;
		if (!el || messageCount === 0 || lastContent === undefined) return;
		el.scrollTop = el.scrollHeight;
	}, [messageCount, lastContent]);

	if (messages.length === 0) {
		return (
			<div className="flex-1 min-h-0 flex items-center justify-center">
				<div className="text-center text-muted-foreground">
					<p className="text-lg">{t("emptyState.title")}</p>
					<p className="text-sm mt-2">{t("emptyState.subtitle")}</p>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={scrollRef}
			className="flex-1 min-h-0 overflow-y-auto pr-2 scroll-smooth"
		>
			<div className="space-y-6 pb-4">
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
		</div>
	);
};

export default ChatContent;
