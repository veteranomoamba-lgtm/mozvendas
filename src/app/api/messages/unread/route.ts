import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/utils";

export async function GET() {
  try {
    const user = await requireAuth();
    const count = await db.message.count({
      where: { receiverId: user.id, isRead: false },
    });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
