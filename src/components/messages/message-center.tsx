"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";
import ptBR from "@/lib/translations/pt-BR";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: { id: string; name: string | null; avatar: string | null };
  receiver: { id: string; name: string | null; avatar: string | null };
}

interface Conversation {
  partner: { id: string; name: string | null; avatar: string | null };
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
  const [selectedPartner, setSelectedPartner] = useState<string | null>(initialPartnerId || null);
  const [selectedPartnerInfo, setSelectedPartnerInfo] = useState<{ id: string; name: string | null; avatar: string | null } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(!!initialPartnerId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) setNewMessage(initialMessage);
  }, [initialMessage]);

  useEffect(() => {
    if (initialPartnerId) {
      setSelectedPartner(initialPartnerId);
      setShowMobileChat(true);
    }
  }, [initialPartnerId]);

  // Fetch conversations
  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/messages")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [session]);

  // Fetch messages for selected partner
  useEffect(() => {
    if (!selectedPartner) return;
    fetch(`/api/messages?with=${selectedPartner}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          // Obter info do parceiro
          const conv = conversations.find((c) => c.partner.id === selectedPartner);
          if (conv) setSelectedPartnerInfo(conv.partner);
          else if (data.length > 0) {
            const msg = data[0];
            const partner = msg.senderId === session?.user?.id ? msg.receiver : msg.sender;
            setSelectedPartnerInfo(partner);
          }
        }
      })
      .catch(() => {});
  }, [selectedPartner, conversations]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-refresh messages a cada 5 segundos
  useEffect(() => {
    if (!selectedPartner) return;
    const interval = setInterval(() => {
      fetch(`/api/messages?with=${selectedPartner}`)
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setMessages(data); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedPartner]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner || isSending) return;
    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: selectedPartner,
          productId: productId,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        toast.error(err.error || "Falha ao enviar mensagem");
        return;
      }
      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      onSendMessage?.(message);
      // Refresh conversas
      fetch("/api/messages")
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setConversations(data); });
    } catch {
      toast.error("Falha ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectPartner = (conv: Conversation) => {
    setSelectedPartner(conv.partner.id);
    setSelectedPartnerInfo(conv.partner);
    setShowMobileChat(true);
  };

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{ptBR.auth.loginRequired}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      
      {/* Lista de conversas - esconde no mobile quando chat aberto */}
      <div className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-1/3 border-r bg-muted/30 flex-col`}>
        <CardHeader className="border-b py-3">
          <CardTitle className="text-base">💬 Conversas</CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Ainda não tens conversas.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clica em "Contactar Vendedor" num produto para começar!
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.partner.id}
                onClick={() => handleSelectPartner(conv)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b ${
                  selectedPartner === conv.partner.id ? "bg-muted" : ""
                }`}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={conv.partner.avatar || ""} />
                  <AvatarFallback>
                    {conv.partner.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      {conv.partner.name || "Utilizador"}
                    </span>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-1 text-xs px-1.5">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className={`${showMobileChat ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
        {selectedPartner && selectedPartnerInfo ? (
          <>
            {/* Header do chat */}
            <div className="flex items-center gap-3 p-3 border-b bg-muted/20">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedPartnerInfo.avatar || ""} />
                <AvatarFallback>
                  {selectedPartnerInfo.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {selectedPartnerInfo.name || "Utilizador"}
              </span>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Começa a conversa!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.senderId === session.user.id;
                    return (
                      <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        {!isOwn && (
                          <Avatar className="h-6 w-6 mr-2 flex-shrink-0 mt-1">
                            <AvatarImage src={message.sender.avatar || ""} />
                            <AvatarFallback className="text-xs">
                              {message.sender.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          isOwn ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-0.5 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Escreve uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                  autoFocus={!!initialMessage}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium mb-1">As tuas mensagens</p>
            <p className="text-sm text-muted-foreground">
              Selecciona uma conversa ou contacta um vendedor num produto
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
