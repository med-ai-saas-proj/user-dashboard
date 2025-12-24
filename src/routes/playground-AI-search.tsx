import ChatContent from '@/features/playground-chat/components/ChatContent';
import ChatInput from '@/features/playground-chat/components/ChatInput';
import DashboardLayout from '@/layouts/dashboard-layout';

export default function PlaygroundAISearchPage() {
  return (
    <DashboardLayout pageTitle="AI Search" className="pb-0">
      <div className="w-full h-full flex flex-col items-stretch justify-between px-4 sm:px-6 md:px-12 lg:px-24 xl:px-64 relative">
        <ChatContent />
        <ChatInput />
      </div>
    </DashboardLayout>
  );
}
