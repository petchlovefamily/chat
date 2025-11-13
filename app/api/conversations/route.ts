import { NextResponse } from 'next/server';
import { conversations, users, Conversation } from '@/lib/db';

// 1. GET: ดึงรายการบทสนทนาของ User [cite: 18]
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Filter เอาเฉพาะห้องที่มี user คนนี้อยู่
  const userConversations = conversations
    .filter((conv) => conv.participants.includes(userId))
    .map((conv) => {
      // หาชื่อเพื่อนคู่สนทนา (Other Participant Info) [cite: 18]
      const otherUserId = conv.participants.find((id) => id !== userId);
      const otherUser = users.find((u) => u.id === otherUserId);
      
      return {
        ...conv,
        otherUser, // ส่งข้อมูลเพื่อนไปด้วย เพื่อความง่ายในการแสดงผล
      };
    })
    // เรียงตามเวลาข้อความล่าสุด (ใหม่สุดขึ้นก่อน) [cite: 19]
    .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

  return NextResponse.json(userConversations);
}

// 2. POST: สร้างบทสนทนาใหม่ [cite: 20]
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // คนที่กดสร้าง (Current User)

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { participantId } = body; // ID ของคนที่เราจะคุยด้วย

  // Validation: ห้ามคุยกับตัวเอง และต้องมีเพื่อนอยู่จริง [cite: 23]
  if (!participantId || participantId === userId) {
    return NextResponse.json({ error: 'Invalid participant' }, { status: 400 });
  }

  // ป้องกันห้องซ้ำ (Duplicate Check) [cite: 20]
  const existing = conversations.find(
    (c) => c.participants.includes(userId) && c.participants.includes(participantId)
  );

  if (existing) {
    return NextResponse.json(existing); // ถ้ามีแล้ว ส่งอันเดิมกลับไปเลย
  }

  // สร้างห้องใหม่
  const newConversation: Conversation = {
    id: `conv_${Date.now()}`,
    participants: [userId, participantId],
    lastMessage: undefined // ยังไม่มีข้อความ
  };

  conversations.push(newConversation);
  return NextResponse.json(newConversation, { status: 201 });
}