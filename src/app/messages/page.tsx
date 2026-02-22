"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { MessageCenter } from "@/components/messages/message-center";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Mensagens</h1>
        <MessageCenter />
      </main>
      <Footer />
    </div>
  );
}
