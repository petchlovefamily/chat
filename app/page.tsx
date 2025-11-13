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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 relative overflow-hidden">
        {/* Animated Aurora Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-teal-500/15 via-emerald-500/15 to-green-500/15 animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-gradient-to-bl from-sky-500/15 via-teal-500/15 to-emerald-500/15 animate-[spin_25s_linear_infinite_reverse]"></div>
        </div>

        <div className="relative backdrop-blur-2xl bg-white/10 p-12 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_60px_rgba(20,184,166,0.2)] w-[480px] border border-white/20">
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto mb-6 rounded-[28px] bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.4)] relative">
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-teal-400/40 to-green-500/40 blur-xl"></div>
              <span className="text-5xl relative z-10">💬</span>
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal-200 via-emerald-200 to-green-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]">Welcome Back</h1>
            <p className="text-slate-200/70 text-sm">Select your profile to continue</p>
          </div>
          
          <div className="space-y-3">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => router.push(`/?userId=${user.id}`)}
                className="w-full p-5 backdrop-blur-xl bg-white/5 hover:bg-white/10 rounded-[24px] text-left border border-white/10 hover:border-teal-400/50 transition-all duration-500 flex justify-between items-center group hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] text-lg relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/30 to-green-500/30 blur-lg group-hover:blur-xl transition-all"></div>
                    <span className="relative z-10">{user.name.charAt(0)}</span>
                  </div>
                  <span className="font-semibold text-white text-lg drop-shadow-lg">{user.name}</span>
                </div>
                <svg className="w-6 h-6 text-teal-300/60 group-hover:text-teal-300 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-300/40 tracking-wider uppercase">Secure Healthcare Communication</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-teal-500/8 via-emerald-500/8 to-green-500/8 animate-[spin_30s_linear_infinite]"></div>
        <div className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-gradient-to-bl from-sky-500/8 via-teal-500/8 to-emerald-500/8 animate-[spin_35s_linear_infinite_reverse]"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-2xl bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-8 py-6 flex justify-between items-center sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.4)] relative">
            <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-teal-400/40 to-green-500/40 blur-xl"></div>
            <span className="text-2xl relative z-10">💬</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(20,184,166,0.4)]">Telehealth</h1>
            <p className="text-xs text-slate-300/60">Secure Messaging</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="backdrop-blur-xl bg-white/10 px-6 py-3 rounded-[20px] border border-white/20 shadow-inner">
            <div className="text-[10px] text-teal-200/70 uppercase tracking-wider mb-1">Active User</div>
            <div className="font-semibold text-white flex items-center gap-2 text-sm drop-shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
              {currentUser?.name}
            </div>
          </div>
          <a 
            href="/" 
            className="text-sm text-white backdrop-blur-xl bg-white/5 hover:bg-red-500/20 px-6 py-3 rounded-[20px] border border-white/20 hover:border-red-400/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(248,113,113,0.4)] font-medium"
          >
            Sign Out
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 max-w-[1400px] w-full mx-auto p-8 gap-6 flex h-[calc(100vh-96px)]">
        
        {/* Left Sidebar - Glass Card */}
        <div className="w-[380px] backdrop-blur-2xl bg-white/10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <h2 className="font-bold text-white text-lg drop-shadow-lg">Messages</h2>
            <p className="text-xs text-slate-300/60 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>

          {/* New Chat Buttons */}
          {availableUsers.length > 0 && (
            <div className="px-4 pt-4 pb-3 bg-white/5 border-b border-white/10">
              <div className="text-xs text-teal-200/70 mb-3 font-semibold uppercase tracking-wide">Start new conversation</div>
              <div className="space-y-2">
                {availableUsers.map(u => (
                  <button 
                    key={u.id} 
                    onClick={() => startNewChat(u.id)} 
                    className="w-full text-sm backdrop-blur-xl bg-white/5 text-white py-3.5 px-4 rounded-[20px] hover:bg-white/10 border border-white/20 hover:border-teal-400/50 transition-all duration-300 flex items-center gap-3 group shadow-lg hover:shadow-[0_0_25px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                      {u.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-left font-semibold">{u.name}</span>
                    <svg className="w-4 h-4 text-teal-300/60 group-hover:text-teal-300 transition-all group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-300/60">
                <div className="w-10 h-10 border-3 border-white/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-3 shadow-[0_0_20px_rgba(20,184,166,0.4)]"></div>
                <div className="text-sm font-medium">Loading...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-12 text-center text-slate-300/40">
                <div className="w-20 h-20 backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <span className="text-4xl opacity-60">💬</span>
                </div>
                <p className="text-sm font-semibold text-slate-200/70">No conversations yet</p>
                <p className="text-xs text-slate-300/40 mt-1">Start chatting above</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-5 border-b border-white/10 cursor-pointer transition-all duration-300 ${
                    selectedConvId === conv.id 
                      ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 shadow-[inset_4px_0_0_#14b8a6]' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-[0_0_15px_rgba(20,184,166,0.3)] relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/30 to-green-500/30 blur-md"></div>
                      <span className="relative z-10">{conv.otherUser?.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-white text-sm drop-shadow-lg">{conv.otherUser?.name}</span>
                        {conv.lastMessage && (
                          <span className="text-[11px] text-slate-300/50">
                            {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-200/70 truncate">
                        {conv.lastMessage ? (
                            <span>
                                {conv.lastMessage.senderId === userId && <span className="text-teal-300 font-semibold">You: </span>}
                                {conv.lastMessage.content}
                            </span>
                        ) : (
                            <span className="italic text-slate-300/40">No messages yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Chat Room - Glass Card */}
        <div className="flex-1 backdrop-blur-2xl bg-white/10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-col border border-white/20 overflow-hidden">
          {selectedConvId ? (
            <ChatRoom 
                key={selectedConvId}
                conversationId={selectedConvId} 
                userId={userId} 
                currentUserName={currentUser?.name || 'You'}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300/30">
              <div className="w-32 h-32 backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 blur-xl"></div>
                <span className="text-7xl opacity-50 relative z-10">💬</span>
              </div>
              <div className="text-2xl font-bold text-slate-200/60 mb-2 drop-shadow-lg">Select a conversation</div>
              <div className="text-sm text-slate-300/40">Choose from the sidebar to start messaging</div>
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
      <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gradient-to-b from-white/5 to-transparent">
        {loading ? (
          <div className="text-center text-slate-300/60 mt-12">
            <div className="w-10 h-10 border-3 border-white/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-3 shadow-[0_0_20px_rgba(20,184,166,0.4)]"></div>
            <div className="text-sm font-medium">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-300/40 mt-12">
              <div className="w-20 h-20 backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <span className="text-5xl opacity-50">👋</span>
              </div>
              <p className="text-base font-bold text-slate-200/70">No messages yet</p>
              <p className="text-sm text-slate-300/40 mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === userId;
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.5s_ease-out]`}
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <div 
                  className={`max-w-[65%] rounded-[28px] px-6 py-4 transition-all duration-300 hover:scale-[1.02] ${
                    isMe 
                      ? 'bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 text-white rounded-br-md shadow-[0_8px_24px_rgba(20,184,166,0.35),0_0_30px_rgba(16,185,129,0.15)] relative before:absolute before:inset-0 before:rounded-[28px] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-50' 
                      : 'backdrop-blur-xl bg-white/10 text-white border border-white/20 rounded-bl-md shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <div className="text-[15px] leading-relaxed relative z-10 font-medium">{msg.content}</div>
                  <div className={`text-[11px] mt-2 text-right relative z-10 ${isMe ? 'text-white/60' : 'text-slate-300/50'}`}>
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
      <div className="p-6 backdrop-blur-xl bg-white/5 border-t border-white/10">
        <div className="flex gap-3 items-end">
          <div className="flex-1 backdrop-blur-xl bg-white/10 rounded-[24px] border border-white/20 focus-within:border-teal-400/50 focus-within:bg-white/15 transition-all duration-300 shadow-lg focus-within:shadow-[0_0_25px_rgba(20,184,166,0.2)]">
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
              className="w-full px-6 py-4 bg-transparent focus:outline-none text-white placeholder-slate-300/40 text-[15px] font-medium"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-14 h-14 bg-gradient-to-br from-teal-400 via-emerald-500 to-green-500 text-white rounded-[20px] font-bold hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 disabled:hover:scale-100 shadow-[0_8px_24px_rgba(20,184,166,0.35)] flex items-center justify-center flex-shrink-0 relative disabled:shadow-none"
          >
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-teal-400/40 to-green-500/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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