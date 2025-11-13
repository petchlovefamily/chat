import { NextResponse } from 'next/server';
import { users } from '@/lib/db';

export async function GET(request: Request) {
  // โจทย์ให้จำลองการ Login ด้วย query param หรือ header [cite: 14]
  // เราจะดึง userId จาก Query Param ง่ายๆ เช่น ?userId=user_1
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized: Missing userId' }, { status: 401 });
  }

  const user = users.find((u) => u.id === userId);
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}