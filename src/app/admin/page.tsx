"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Shield, Loader2 } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }
  if (session.user.role !== "ADMIN") { redirect("/"); }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}
