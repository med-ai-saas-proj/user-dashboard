function ChatSender({ message }: { message: string }) {
	return (
		<div className="flex justify-end">
			<div className="max-w-[70%] bg-[#f4f4f4] rounded-sm p-4">{message}</div>
		</div>
	);
}

export default ChatSender;
