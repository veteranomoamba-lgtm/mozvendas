"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, Camera } from "lucide-react";

const PROVINCES = ["Maputo Cidade","Maputo Província","Gaza","Inhambane","Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa"];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODOS os useEffect ANTES de qualquer return condicional
  useEffect(() => {
    if (!session) return;
    fetch("/api/profile").then(r => r.json()).then(data => {
      setName(data.name || "");
      setBio(data.bio || "");
      setPhone(data.phone || "");
      setProvince(data.province || "");
      setAvatar(data.avatar || "");
    }).finally(() => setIsFetching(false));
  }, [session]);

  // Returns condicionais SÓ depois de todos os hooks
  if (status === "loading") return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (!session) { redirect("/?auth=login"); }

  if (isFetching) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem não pode ter mais de 5MB!");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor seleccione uma imagem válida!");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvatar(data.avatar);
      await update({ avatar: data.avatar });
      toast.success("Foto de perfil actualizada! 📸");
    } catch {
      toast.error("Falha ao carregar a foto. Tente novamente.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, phone, province }),
      });
      if (!res.ok) throw new Error();
      await update({ name });
      toast.success("Perfil actualizado com sucesso!");
    } catch {
      toast.error("Falha ao actualizar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" /> Meu Perfil
          </h1>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {/* Avatar com botão de upload */}
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || session!.user.avatar || ""} />
                    <AvatarFallback className="text-2xl font-bold">
                      {session!.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Overlay ao passar o rato */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {isUploadingAvatar
                      ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                      : <Camera className="h-6 w-6 text-white" />
                    }
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{session!.user.name}</h2>
                  <p className="text-muted-foreground text-sm">{session!.user.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {session!.user.role === "ADMIN" ? "🛡️ Admin" : session!.user.role === "SELLER" ? "🏪 Vendedor" : "🛒 Comprador"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 flex items-center gap-1"
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> A carregar...</>
                      : <><Camera className="h-3 w-3" /> Alterar foto</>
                    }
                  </Button>
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
                  <SelectContent>
                    {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
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
