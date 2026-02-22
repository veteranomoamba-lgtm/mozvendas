"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import ptBR from "@/lib/translations/pt-BR";

const PROVINCES = ["Maputo Cidade","Maputo Província","Gaza","Inhambane","Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa"];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(data => {
      setName(data.name || "");
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setProvince(data.province || "");
    }).finally(() => setIsFetching(false));
  }, []);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, phone, province }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil actualizado com sucesso!");
    } catch {
      toast.error("Falha ao actualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><User className="h-6 w-6" /> Meu Perfil</h1>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session.user.avatar || ""} />
                  <AvatarFallback className="text-2xl font-bold">{session.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-lg">{session.user.name}</h2>
                  <p className="text-muted-foreground">{session.user.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {session.user.role === "ADMIN" ? "🛡️ Admin" : session.user.role === "SELLER" ? "🏪 Vendedor" : "🛒 Comprador"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="O seu nome" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telemóvel</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+258 84 000 0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Província</Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger><SelectValue placeholder="Seleccione a sua província" /></SelectTrigger>
                  <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre mim</Label>
                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre si..." rows={3} />
              </div>
              <Button onClick={handleUpdate} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Alterações
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
