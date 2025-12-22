import { MarkdownCustom } from './MarkdownCustom';

function ChatReceiver({ message }: { message: string }) {
  return (
    <div className="h-full flex items-start">
      <div className="text-black p-3 max-w-[70%]">
        <MarkdownCustom content={message} />
      </div>
    </div>
  );
}

export default ChatReceiver;
