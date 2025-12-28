import { MarkdownCustom } from './MarkdownCustom';

function ChatReceiver({ message }: { message: string }) {
  return (
    <div className="h-fit flex items-start">
      <div className="w-full">
        <MarkdownCustom content={message} />
      </div>
    </div>
  );
}

export default ChatReceiver;
