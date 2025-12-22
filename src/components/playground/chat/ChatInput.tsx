import { ChevronUp, Plus } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/shadcn/input-group';

function ChatInput() {
  return (
    <div className="sticky bottom-0 w-full z-50 bg-white pb-4">
      <div className="w-full flex items-center justify-center">
        <InputGroup className="max-w-4xl">
          <InputGroupTextarea placeholder="Type your message..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="outline"
              className="rounded-full mr-2"
              size="icon-sm"
            >
              <Plus />
            </InputGroupButton>
            <InputGroupButton
              variant="default"
              className="rounded-full ml-auto"
              size="icon-sm"
            >
              <ChevronUp />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}

export default ChatInput;
