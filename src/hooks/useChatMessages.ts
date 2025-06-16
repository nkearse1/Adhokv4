// useChatMessages.ts
import { useState, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'talent' | 'client';
  text: string;
  timestamp: Date;
  deliverableId?: string;
}

export function useChatMessages(projectId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load mock messages — replace with fetch in real version
    const mockMessages: ChatMessage[] = [
      {
        id: 'init-1',
        sender: 'client',
        text: 'Welcome to the workspace! Let us know when you\'re ready to begin.',
        timestamp: new Date(),
      }
    ];
    setMessages(mockMessages);
  }, [projectId]);

  const sendMessage = (text: string, deliverableId?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: 'talent', // This would be determined by user role in real implementation
      timestamp: new Date(),
      deliverableId
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate partner typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for reaching out! I\'m excited to work with you on this project. Let me review your recommendations.',
        sender: 'client',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  return { messages, setMessages, sendMessage, isTyping };
}