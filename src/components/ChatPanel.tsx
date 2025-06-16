// ChatPanel.tsx
import { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChatMessages } from '@/hooks/useChatMessages';

interface Deliverable {
  id: string;
  title: string;
}

interface ChatPanelProps {
  role: 'client' | 'talent';
  projectId: string;
  partnerTypingLabel?: string;
  projectStatus: string;
  deliverables: Deliverable[];
  onActivity?: (desc: string) => void;
}

const accessibleStatuses = [
  'Picked Up',
  'Scope Defined',
  'In Progress',
  'Submitted',
  'Revisions',
  'Final Payment',
  'Approved',
  'Performance Tracking',
  'Complete'
];

export default function ChatPanel({ 
  role, 
  projectId,
  partnerTypingLabel = "Partner is typing...",
  projectStatus,
  deliverables = [],
  onActivity
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);

  const { messages, setMessages, sendMessage, isTyping } = useChatMessages(projectId);

  const canSendMessages = accessibleStatuses.some(
    (status) => status.toLowerCase() === projectStatus.toLowerCase()
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !canSendMessages) return;
    const text = newMessage.trim();
    sendMessage(text, selectedDeliverableId || undefined);
    onActivity?.(`Sent message: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showIntroductionPrompt =
    ((role === 'talent' || role === 'client') &&
      projectStatus === 'Picked Up' &&
      messages.length === 0);

  return (
    <div className="bg-white border border-[#E6E9F4] rounded-lg h-[600px] flex flex-col">
      <div className="p-4 border-b border-[#E6E9F4]">
        <h3 className="font-semibold text-[#2E3A8C]">Project Chat</h3>
        <p className="text-sm text-gray-600">
          Status: <span className="font-medium">{projectStatus}</span>
        </p>
      </div>

      {!canSendMessages && (
        <div className="bg-yellow-100 text-yellow-900 text-sm px-4 py-2 border-b border-yellow-300">
          Messaging will be enabled once the project is picked up.
        </div>
      )}

      {showIntroductionPrompt && (
        <div className="bg-blue-50 text-blue-900 text-sm px-4 py-3 border-b border-blue-200">
          <p className="font-medium mb-2">👋 Time to introduce yourself!</p>
          <p className="text-xs">
            Reach out to the {role === 'client' ? 'talent' : 'client'} to introduce yourself, review the original deliverables,
            and confirm or recommend the work needed.
          </p>
        </div>
      )}

      {Array.isArray(deliverables) && deliverables.length > 0 && (
        <div className="p-2 border-b border-[#E6E9F4] flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedDeliverableId(null)}
            className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${!selectedDeliverableId ? 'bg-[#2E3A8C] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            General
          </button>
          {deliverables.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeliverableId(d.id)}
              className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${selectedDeliverableId === d.id ? 'bg-[#2E3A8C] text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {d.title}
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === role ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[70%] ${
                    message.sender === role ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={
                        message.sender === 'client'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }
                    >
                      {message.sender === 'client' ? 'C' : 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === role
                        ? 'bg-[#2E3A8C] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.deliverableId && (
                      <p className="text-xs italic mb-1 opacity-75">
                        Related to: {
                          deliverables.find((d) => d.id === message.deliverableId)?.title || 'Unknown'
                        }
                      </p>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={
                      role === 'client'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }
                  >
                    {role === 'client' ? 'T' : 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm text-gray-600 italic">{partnerTypingLabel}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#E6E9F4]">
        {canSendMessages ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  showIntroductionPrompt
                    ? 'Introduce yourself and discuss deliverables...'
                    : 'Type your message...'
                }
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#2E3A8C] hover:bg-[#1B276F]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            Chat will be enabled once the project is picked up
          </div>
        )}
      </div>
    </div>
  );
}
