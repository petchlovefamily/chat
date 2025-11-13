import { NextResponse } from 'next/server';
import { messages, conversations, Message } from '@/lib/db';

// แก้ไข Type ตรงนี้ให้ params เป็น Promise
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 1. GET: ดึงข้อความในห้องแชท
export async function GET(request: Request, { params }: RouteParams) {
  // แก้ไข: ต้อง await params ก่อนใช้งาน
  const { id } = await params;
  
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  if (!conversation.participants.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const conversationMessages = messages
    .filter((m) => m.conversationId === id)
    .sort((a, b) => a.timestamp - b.timestamp);

  return NextResponse.json(conversationMessages);
}

// 2. POST: ส่งข้อความใหม่
export async function POST(request: Request, { params }: RouteParams) {
  // แก้ไข: ต้อง await params ก่อนใช้งาน
  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'Message content required' }, { status: 400 });
  }

  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  if (!conversation.participants.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    conversationId: id,
    senderId: userId,
    content: content,
    timestamp: Date.now(),
  };

  messages.push(newMessage);
  
  // Update last message
  conversation.lastMessage = newMessage;

  return NextResponse.json(newMessage, { status: 201 });
}