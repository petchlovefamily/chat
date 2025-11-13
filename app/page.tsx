// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// --- 1. Shared Types & Constants ---

const USERS = [
  { id: 'user_1', name: 'Alice (You)' },
  { id: 'user_2', name: 'Bob' },
  { id: 'user_3', name: 'Charlie' },
];

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  participants: string[];
  otherUser?: User;
  lastMessage?: Message;
}

// --- 2. Main Component (Home) ---

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white p-12 rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] w-[460px] border border-gray-100">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-4xl">💬</span>
            </div>
            <h1 className="text-3xl font-semibold mb-2 text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Select your profile to continue</p>
          </div>
          
          <div className="space-y-3">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => router.push(`/?userId=${user.id}`)}
                className="w-full p-5 bg-gray-50 hover:bg-blue-50 rounded-[20px] text-left border border-gray-100 hover:border-blue-200 transition-all duration-300 flex justify-between items-center group hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900 text-lg">{user.name}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">Secure Healthcare Communication</p>
          </div>
        </div>
      </div>
    );
  }

  return <ChatInterface userId={userId} />;
}

// --- 3. Chat Interface (Layout & Sidebar) ---

function ChatInterface({ userId }: { userId: string }) {
  const currentUser = USERS.find(u => u.id === userId);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const startNewChat = async (participantId: string) => {
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ participantId }),
      });
      if (res.ok) {
        const newConv = await res.json();
        await fetchConversations();
        setSelectedConvId(newConv.id);
      }
    } catch (error) {
      alert('Failed to start chat');
    }
  };

  const availableUsers = USERS.filter(u => 
    u.id !== userId && !conversations.some(c => c.otherUser?.id === u.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm px-8 py-6 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Telehealth</h1>
            <p className="text-xs text-gray-500">Secure Messaging</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-50 px-5 py-3 rounded-[16px] border border-gray-100">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Active User</div>
            <div className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              {currentUser?.name}
            </div>
          </div>
          <a 
            href="/" 
            className="text-sm text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-5 py-3 rounded-[16px] border border-gray-200 hover:border-red-200 transition-all duration-300"
          >
            Sign Out
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-8 gap-6 flex h-[calc(100vh-96px)]">
        
        {/* Left Sidebar - Floating Card */}
        <div className="w-[360px] bg-white rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-base">Messages</h2>
            <p className="text-xs text-gray-500 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>

          {/* New Chat Buttons */}
          {availableUsers.length > 0 && (
            <div className="px-4 pt-4 pb-3 bg-gray-50 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-3 font-medium">Start new conversation</div>
              <div className="space-y-2">
                {availableUsers.map(u => (
                  <button 
                    key={u.id} 
                    onClick={() => startNewChat(u.id)} 
                    className="w-full text-sm bg-white text-gray-900 py-3 px-4 rounded-[16px] hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-300 flex items-center gap-3 group shadow-sm hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-left font-medium">{u.name}</span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                <div className="text-sm">Loading...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl opacity-40">💬</span>
                </div>
                <p className="text-sm font-medium text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting above</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-5 border-b border-gray-100 cursor-pointer transition-all duration-300 ${
                    selectedConvId === conv.id 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
                      {conv.otherUser?.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{conv.otherUser?.name}</span>
                        {conv.lastMessage && (
                          <span className="text-[11px] text-gray-400">
                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {conv.lastMessage ? (
                            <span>
                                {conv.lastMessage.senderId === userId && <span className="text-blue-600 font-medium">You: </span>}
                                {conv.lastMessage.content}
                            </span>
                        ) : (
                            <span className="italic text-gray-400">No messages yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Chat Room - Floating Card */}
        <div className="flex-1 bg-white rounded-[28px] shadow-[0_20px_70px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 overflow-hidden">
          {selectedConvId ? (
            <ChatRoom 
                key={selectedConvId}
                conversationId={selectedConvId} 
                userId={userId} 
                currentUserName={currentUser?.name || 'You'}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl opacity-40">💬</span>
              </div>
              <div className="text-xl font-medium text-gray-400 mb-2">Select a conversation</div>
              <div className="text-sm text-gray-400">Choose from the sidebar to start messaging</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- 4. Chat Room Component (Messages & Input) ---

function ChatRoom({ conversationId, userId, currentUserName }: { conversationId: string, userId: string, currentUserName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSend = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tempContent = inputText;
    setInputText('');

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?userId=${userId}`, {
        method: 'POST',
        body: JSON.stringify({ content: tempContent }),
      });
      
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      alert('Failed to send message');
      setInputText(tempContent);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gradient-to-b from-gray-50/30 to-transparent">
        {loading ? (
          <div className="text-center text-gray-400 mt-12">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-sm">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl opacity-40">👋</span>
              </div>
              <p className="text-base font-medium text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === userId;
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.4s_ease-out]`}
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div 
                  className={`max-w-[65%] rounded-[24px] px-5 py-3.5 shadow-md transition-all duration-300 hover:shadow-lg ${
                    isMe 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-br-md' 
                      : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                  }`}
                >
                  <div className="text-[15px] leading-relaxed">{msg.content}</div>
                  <div className={`text-[11px] mt-2 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-gray-50 rounded-[20px] border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-all duration-300 shadow-sm focus-within:shadow-md">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full px-5 py-4 bg-transparent focus:outline-none text-gray-900 placeholder-gray-400 text-[15px]"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-[16px] font-semibold hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-md flex items-center justify-center flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>