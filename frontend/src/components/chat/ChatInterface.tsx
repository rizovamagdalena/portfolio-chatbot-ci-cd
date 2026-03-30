import { useRef, useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { ChatInput } from './ChatInput';
import { ExampleQueries } from './ExampleQueries';
import { ProjectsSidebar } from './ProjectsSidebar';

export function ChatInterface() {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const showExamples = messages.length === 1;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ProjectsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          onClear={clearChat}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && <ThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="border-t border-border/30 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {showExamples && (
              <ExampleQueries onSelect={sendMessage} disabled={isLoading} />
            )}
            <ChatInput onSend={sendMessage} disabled={isLoading} />
          </div>
        </footer>
      </div>
    </div>
  );
}
