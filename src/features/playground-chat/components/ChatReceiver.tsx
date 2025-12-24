import { MarkdownCustom } from './MarkdownCustom';

function ChatReceiver({ message }: { message: string }) {
  return (
    <div className="h-fit flex items-start">
      <div className="w-full mt-12">
        <MarkdownCustom content={message} />
      </div>
    </div>
  );
}

export default ChatReceiver;
