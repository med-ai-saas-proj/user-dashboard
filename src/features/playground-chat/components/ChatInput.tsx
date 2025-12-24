import { ChevronUp, Plus } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/shadcn/input-group';

const ChatInput = () => {
  return (
    <div className="sticky bottom-0 w-full z-50 bg-background pb-4">
      <div className="w-full flex items-center">
        <InputGroup className="w-full mx-auto">
          <InputGroupTextarea placeholder="Type your message..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton
              variant="outline"
              className="rounded-full mr-2"
              size="icon-sm"
              hidden
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
};

export default ChatInput;
