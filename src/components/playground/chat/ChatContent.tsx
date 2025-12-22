import ChatReceiver from './ChatReceiver';
import ChatSender from './ChatSender';

function ChatContent() {
  const dummyMarkdownText = `# Introduction

This content is coming from the **backend**.

### Features
* Dynamic rendering
* Tailwind styling
* Shadcn integration

Here is some code:
\`\`\`js
console.log("Hello from the API!");
\`\`\`

Lorem ipsum, dolor sit amet consectetur adipisicing elit. Similique asperiores non, ipsam nostrum aperiam beatae. Deleniti, id nesciunt eum perspiciatis recusandae earum vel ex nisi rerum natus iusto? Qui, totam?

### Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum vel itaque, totam provident rerum exercitationem assumenda id incidunt, vitae dolor asperiores omnis. Repudiandae corporis, consequatur nulla doloribus quidem eaque optio.

Thank you for using our service!

### For more information, visit [our website](https://example.com).

## Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repudiandae sit ipsum possimus facilis excepturi ullam quas consectetur, qui laboriosam voluptatem provident beatae? Fuga recusandae tenetur distinctio nam suscipit cum doloremque!
`;

  return (
    <div className="w-4xl h-full">
      <ChatSender message="Hello, how can I help you? lorem ipsum dolor sit amet, consectetur adipiscing elit." />
      <ChatReceiver message={dummyMarkdownText} />
    </div>
  );
}

export default ChatContent;
