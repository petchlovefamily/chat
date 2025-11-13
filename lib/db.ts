// src/lib/db.ts

// 1. Type Definition (Bonus: TypeScript)
export interface User {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: string[]; // เก็บ User ID ของคู่สนทนา (เช่น ['user_1', 'user_2'])
  lastMessage?: Message;  // เก็บข้อความล่าสุดไว้แสดงหน้า List (Optional แต่ช่วยให้ง่ายขึ้น)
}

// 2. Mock Data (In-memory Database)
// โจทย์บอกให้ Hardcode Users ได้เลย [cite: 14]
export const users: User[] = [
  { id: 'user_1', name: 'Alice (You)' },
  { id: 'user_2', name: 'Bob' },
  { id: 'user_3', name: 'Charlie' },
];

// เก็บข้อมูลบทสนทนา
export let conversations: Conversation[] = [];

// เก็บข้อมูลข้อความทั้งหมด
export let messages: Message[] = [];