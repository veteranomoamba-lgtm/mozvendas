import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1, "A mensagem não pode estar vazia"),
  receiverId: z.string(),
  productId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get("with");

    if (conversationWith) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      await db.message.updateMany({
        where: { senderId: conversationWith, receiverId: user.id, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json(messages);
    }

    // ✅ CORRIGIDO: buscar todas as mensagens com sender e receiver incluídos
    const allMessages = await db.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const receivedMessages = allMessages.filter((m) => m.receiverId === user.id);

    const conversations = new Map();

    allMessages.forEach((msg) => {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === user.id ? msg.receiver : msg.sender;

      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: receivedMessages.filter(
            (m) => m.senderId === partnerId && !m.isRead
          ).length,
        });
      }
    });

    return NextResponse.json(Array.from(conversations.values()));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Falha ao buscar mensagens" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();

    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    const receiver = await db.user.findUnique({ where: { id: validatedData.receiverId } });

    if (!receiver || receiver.isBanned) {
      return NextResponse.json({ error: "Cannot send message to this user" }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        content: validatedData.content,
        senderId: user.id,
        receiverId: validatedData.receiverId,
        productId: validatedData.productId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Falha ao enviar mensagem" }, { status: 500 });
  }
}
