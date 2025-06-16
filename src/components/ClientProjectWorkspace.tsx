import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, CalendarIcon, SendIcon, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  DELIVERABLE: 'deliverable',
};

function DeliverableCard({ deliverable, onDrop }) {
  const [, drag] = useDrag({
    type: ItemTypes.DELIVERABLE,
    item: { id: deliverable.id },
  });

  return (
    <div
      ref={drag}
      className={`p-3 border rounded mb-2 cursor-move ${
        deliverable.status === 'approved'
          ? 'bg-green-100 border-green-300'
          : 'bg-blue-100 border-blue-300'
      }`}
    >
      <p className="font-semibold text-sm">{deliverable.title}</p>
      <p className="text-xs text-gray-600">{deliverable.description}</p>
    </div>
  );
}

function DeliverableColumn({ status, deliverables, onDropDeliverable }) {
  const [, drop] = useDrop({
    accept: ItemTypes.DELIVERABLE,
    drop: (item) => onDropDeliverable(item.id, status),
  });

  return (
    <div ref={drop} className="flex-1 p-2 bg-gray-50 border rounded min-h-[200px]">
      <h4 className="text-sm font-semibold mb-2">
        {status === 'approved' ? 'Approved' : 'Recommended'}
      </h4>
      {deliverables
        .filter((d) => d.status === status)
        .map((d) => (
          <DeliverableCard key={d.id} deliverable={d} />
        ))}
    </div>
  );
}

export default function ClientProjectWorkspace() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [deliverables, setDeliverables] = useState([
    {
      id: '1',
      title: 'SEO Audit',
      description: 'Review site structure and meta tags.',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Keyword Plan',
      description: 'Deliver keyword mapping by page.',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Analytics Setup',
      description: 'Google Analytics + Tag Manager.',
      status: 'approved',
    },
    {
      id: '4',
      title: 'Performance Review',
      description: 'Run speed & accessibility audits.',
      status: 'pending',
    },
  ]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    setMessages([
      { id: 1, sender: 'Talent', text: 'Deliverable uploaded ✅', timestamp: new Date() },
    ]);
    setActivityLog(['Project picked up', 'Initial chat sent']);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'Client',
      text: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  const handlePayment = () => {
    alert('💳 Payment flow would initiate here.');
  };

  const handleRevisionRequest = () => {
    alert('🛠️ Request for optimization sent.');
  };

  const handleDropDeliverable = (id, newStatus) => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: newStatus } : d
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2E3A8C]">Client Project Workspace</h1>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#F0F4FF] mb-6 rounded-lg">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <div className="bg-white border border-[#2E3A8C] rounded-lg p-4 shadow-sm">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <strong>{msg.sender}:</strong> {msg.text}{' '}
                    <span className="text-gray-400 text-xs">({format(msg.timestamp, 'p')})</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message..."
                />
                <Button onClick={handleSend} className="bg-[#2E3A8C] text-white">
                  <SendIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliverables">
            <div className="flex gap-4 mb-6">
              <DeliverableColumn
                status="pending"
                deliverables={deliverables}
                onDropDeliverable={handleDropDeliverable}
              />
              <DeliverableColumn
                status="approved"
                deliverables={deliverables}
                onDropDeliverable={handleDropDeliverable}
              />
            </div>
            <Button onClick={handleRevisionRequest} className="bg-[#2E3A8C] text-white">
              Request Optimization
            </Button>
          </TabsContent>

          <TabsContent value="payment">
            <div className="bg-white border border-[#2E3A8C] rounded-lg p-4 shadow-sm">
              <Button onClick={handlePayment} className="bg-[#2E3A8C] text-white">
                <CreditCard className="w-4 h-4 mr-2" /> Send Payment
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-white border border-[#2E3A8C] rounded-lg p-4 shadow-sm">
              <ul className="text-sm list-disc ml-5 text-gray-700">
                {activityLog.map((log, i) => (
                  <li key={i}>{log}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  );
}
