import ChatContent from '@/components/playground/chat/ChatContent';
import ChatInput from '@/components/playground/chat/ChatInput';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function PlaygroundChatPage() {
  return (
    <DashboardLayout pageTitle="Chat" className="pb-0">
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <ChatContent />
        <ChatInput />
      </div>
    </DashboardLayout>
  );
}
