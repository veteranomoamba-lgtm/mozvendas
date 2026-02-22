"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";
import ptBR from "@/lib/translations/pt-BR";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface Conversation {
  partner: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface MessageCenterProps {
  initialPartnerId?: string;
  initialMessage?: string;
  productId?: string;
  onSendMessage?: (message: Message) => void;
}

export function MessageCenter({
  initialPartnerId,
  initialMessage = "",
  productId,
  onSendMessage,
}: MessageCenterProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(
    initialPartnerId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set pre-filled message when it changes
  useEffect(() => {
    if (initialMessage) {
      setNewMessage(initialMessage);
    }
  }, [initialMessage]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/messages");
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedPartner) return;

      try {
        const response = await fetch(`/api/messages?with=${selectedPartner}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedPartner]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedPartner,
          productId: productId,
        }),
      });

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage("");
      onSendMessage?.(message);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {ptBR.auth.loginRequired}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-muted/30">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">{ptBR.messages.title}</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(600px-65px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{ptBR.messages.noConversations}</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partner.id}
                onClick={() => setSelectedPartner(conv.partner.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedPartner === conv.partner.id ? "bg-muted" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={conv.partner.avatar || ""} />
                  <AvatarFallback>
                    {conv.partner.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {conv.partner.name}
                    </span>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedPartner ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === session.user.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder={ptBR.messages.typeMessage}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                  autoFocus={!!initialMessage}
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {ptBR.messages.selectConversation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
