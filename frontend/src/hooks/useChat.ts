import { useState, useCallback } from 'react';
import { Message, QueryResponse } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:8000/api/query';

const generateId = () => Math.random().toString(36).substring(2, 15);

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 **Welcome to the Project Portfolio AI!**

I can help you explore and query your project portfolio. Ask me questions like:

- What technologies does a specific project use?
- Which projects involve AI or machine learning?
- Tell me about the purpose of a project
- Compare different projects

I'll search through your project documentation and provide relevant answers with source citations. Let's get started!`,
  timestamp: new Date(),
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (query: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: 3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: QueryResponse = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        projectsSearched: data.projects_searched,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying API:', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to reach the API. Make sure the backend is running at localhost:8000',
        variant: 'destructive',
      });

      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '❌ **Error:** Unable to connect to the API. Please ensure the backend server is running at `http://localhost:8000`.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    toast({
      title: 'Chat Cleared',
      description: 'Your conversation has been reset.',
    });
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
