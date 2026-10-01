import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, MessageSquare } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { activeRide, chatMessages, sendChatMessage, currentUser } = useApp();
  const [text, setText] = useState('');

  if (!isOpen || !activeRide) return null;

  const currentRideMessages = chatMessages.filter((m) => m.rideId === activeRide.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(activeRide.id, text.trim());
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col h-[480px]">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Trip In-App Chat</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {currentRideMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Direct secure messaging with your assigned driver.
            </div>
          ) : (
            currentRideMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-400 mb-0.5">{msg.senderName}</span>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs max-w-[80%] ${
                      isMe ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message to driver..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 text-xs p-2.5 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
