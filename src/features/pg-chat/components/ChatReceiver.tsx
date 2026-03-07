import { MarkdownCustom } from "./MarkdownCustom";

function ChatReceiver({
	message,
	showCursor,
}: {
	message: string;
	showCursor?: boolean;
}) {
	return (
		<div className="h-fit flex items-start">
			<div className="w-full flex items-end gap-1">
				<MarkdownCustom content={message} />
				{showCursor && (
					<div className="animate-pulse bg-gray-400 w-3 h-4"> </div>
				)}
			</div>
		</div>
	);
}

export default ChatReceiver;
