"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users, Package, Flag, MessageSquare, Ban, CheckCircle, XCircle,
  Loader2, Trash2, Eye, AlertTriangle, ShieldCheck, Clock, Search,
  RefreshCw, TrendingUp, ShoppingCart,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";
import ptBR from "@/lib/translations/pt-BR";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number; totalSellers: number; totalBuyers: number;
  totalProducts: number; activeProducts: number; pendingReports: number; totalMessages: number;
}

interface Report {
  id: string; type: string; reason: string; description: string | null;
  status: string; createdAt: string; reviewNotes?: string | null;
  reporter: { id: string; name: string | null; email: string };
  reportedUser: { id: string; name: string | null; email: string; role?: string } | null;
  reportedProduct: { id: string; title: string } | null;
}

interface User {
  id: string; name: string | null; email: string; role: string;
  isBanned: boolean; bannedReason: string | null; createdAt: string;
  province?: string | null;
  _count: { products: number };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  PENDING:   { label: "Pendente",   variant: "secondary",   icon: <Clock className="h-3 w-3" /> },
  REVIEWED:  { label: "Revisto",    variant: "default",     icon: <Eye className="h-3 w-3" /> },
  RESOLVED:  { label: "Resolvido",  variant: "default",     icon: <CheckCircle className="h-3 w-3" /> },
  DISMISSED: { label: "Descartado", variant: "outline",     icon: <XCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { label: status, variant: "outline", icon: null };
  return (
    <Badge variant={c.variant} className="gap-1 text-xs">
      {c.icon} {c.label}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("reports");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const roleParam = roleFilter !== "all" ? roleFilter : "";
      const statusParam = statusFilter !== "all" ? statusFilter : "";

      const [statsRes, reportsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/reports?status=${statusParam}`),
        fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}&role=${roleParam}`),
      ]);

      if (!statsRes.ok || !reportsRes.ok || !usersRes.ok) throw new Error("API error");

      const [statsData, reportsData, usersData] = await Promise.all([
        statsRes.json(), reportsRes.json(), usersRes.json(),
      ]);

      setStats(statsData.stats);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setUsers(usersData.users || []);
    } catch {
      toast.error("Falha ao carregar dados. Verifique a ligação.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => { fetchData(); }, []);
  // Re-fetch when filters change
  useEffect(() => { if (!isLoading) fetchData(true); }, [roleFilter, statusFilter]);

  // ── Ban / Unban ────────────────────────────────────────────────────────────
  const handleBanUser = async (userId: string, action: "ban" | "unban") => {
    if (action === "ban" && !banReason.trim()) {
      toast.error("Indique o motivo do ban.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: action === "ban", bannedReason: action === "ban" ? banReason : null }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "ban" ? "Utilizador banido com sucesso." : "Ban removido com sucesso.");
      setSelectedUser(null);
      setBanReason("");
      fetchData(true);
    } catch {
      toast.error("Falha ao actualizar utilizador.");
    }
  };

  // ── Change role ────────────────────────────────────────────────────────────
  const handleChangeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Papel alterado para ${role === "SELLER" ? "Vendedor" : "Comprador"}.`);
      fetchData(true);
    } catch {
      toast.error("Falha ao alterar papel.");
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem a certeza? Esta acção é irreversível.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Utilizador eliminado.");
      setSelectedUser(null);
      fetchData(true);
    } catch {
      toast.error("Falha ao eliminar utilizador.");
    }
  };

  // ── Report action ──────────────────────────────────────────────────────────
  const handleReportAction = async (
    reportId: string,
    status: "REVIEWED" | "RESOLVED" | "DISMISSED",
    action: "BAN_USER" | "DELETE_PRODUCT" | "NONE"
  ) => {
    try {
      const res = await fetch(`/api/admin/reports?id=${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action, reviewNotes }),
      });
      if (!res.ok) throw new Error();
      const actionLabels: Record<string, string> = {
        BAN_USER: "Utilizador banido e denúncia resolvida.",
        DELETE_PRODUCT: "Produto removido e denúncia resolvida.",
        NONE: "Denúncia actualizada.",
      };
      toast.success(actionLabels[action]);
      setSelectedReport(null);
      setReviewNotes("");
      fetchData(true);
    } catch {
      toast.error("Falha ao actualizar denúncia.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">A carregar painel de administração...</p>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === "PENDING");
  const filteredReports = statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Painel de Administração
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie utilizadores, produtos e denúncias</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilizadores</p>
                <p className="text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.totalSellers ?? 0} vendedores · {stats?.totalBuyers ?? 0} compradores
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-3xl font-bold">{stats?.totalProducts ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats?.activeProducts ?? 0} activos</p>
              </div>
              <Package className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${(stats?.pendingReports ?? 0) > 0 ? "border-l-red-500" : "border-l-gray-300"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Denúncias Pendentes</p>
                <p className={`text-3xl font-bold ${(stats?.pendingReports ?? 0) > 0 ? "text-red-600" : ""}`}>
                  {stats?.pendingReports ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {reports.length} no total
                </p>
              </div>
              <Flag className={`h-10 w-10 opacity-50 ${(stats?.pendingReports ?? 0) > 0 ? "text-red-500" : "text-gray-400"}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mensagens</p>
                <p className="text-3xl font-bold">{stats?.totalMessages ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">total de conversas</p>
              </div>
              <MessageSquare className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending reports */}
      {(stats?.pendingReports ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-400">
              {stats?.pendingReports} denúncia{stats?.pendingReports !== 1 ? "s" : ""} aguardam revisão
            </p>
            <p className="text-sm text-red-600 dark:text-red-500">Reveja e tome acção o mais brevemente possível.</p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => { setActiveTab("reports"); setStatusFilter("PENDING"); }}>
            Ver agora
          </Button>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="h-4 w-4" />
            Denúncias
            {(stats?.pendingReports ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {stats?.pendingReports}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Utilizadores
            <span className="text-xs text-muted-foreground">({users.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ══════════════ REPORTS TAB ══════════════ */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" /> Gestão de Denúncias
                  </CardTitle>
                  <CardDescription>{filteredReports.length} denúncia{filteredReports.length !== 1 ? "s" : ""}</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="PENDING">⏳ Pendentes</SelectItem>
                    <SelectItem value="REVIEWED">👁 Revistas</SelectItem>
                    <SelectItem value="RESOLVED">✅ Resolvidas</SelectItem>
                    <SelectItem value="DISMISSED">❌ Descartadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Flag className="h-12 w-12 opacity-20 mb-3" />
                  <p className="font-medium">Nenhuma denúncia encontrada</p>
                  <p className="text-sm">
                    {statusFilter !== "all" ? "Tente outro filtro" : "Tudo limpo por enquanto!"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[100px]">Tipo</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Alvo</TableHead>
                        <TableHead>Denunciante</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Acção</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report) => (
                        <TableRow
                          key={report.id}
                          className={report.status === "PENDING" ? "bg-red-50/30 dark:bg-red-950/10" : ""}
                        >
                          <TableCell>
                            <Badge variant={report.type === "PRODUCT" ? "secondary" : "outline"} className="text-xs">
                              {report.type === "PRODUCT" ? "📦 Produto" : "👤 Utilizador"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[180px]">
                            <p className="truncate text-sm font-medium">{report.reason}</p>
                            {report.description && (
                              <p className="truncate text-xs text-muted-foreground">{report.description}</p>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[140px]">
                            <p className="truncate text-sm">
                              {report.type === "USER"
                                ? (report.reportedUser?.name || report.reportedUser?.email || "—")
                                : (report.reportedProduct?.title || "—")}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {report.reporter.name || report.reporter.email}
                          </TableCell>
                          <TableCell><StatusBadge status={report.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: dateLocale })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedReport(report); setReviewNotes(""); }}>
                              <Eye className="h-4 w-4 mr-1" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════ USERS TAB ══════════════ */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Gestão de Utilizadores</CardTitle>
                  <CardDescription>{users.length} utilizador{users.length !== 1 ? "es" : ""}</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar utilizadores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchData(true)}
                      className="pl-8 w-full sm:w-[220px]"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="BUYER">Compradores</SelectItem>
                      <SelectItem value="SELLER">Vendedores</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => fetchData(true)}>
                    <Search className="h-4 w-4 mr-1" /> Pesquisar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 opacity-20 mb-3" />
                  <p className="font-medium">Nenhum utilizador encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Produtos</TableHead>
                        <TableHead>Registado</TableHead>
                        <TableHead className="text-right">Acções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className={user.isBanned ? "opacity-60 bg-red-50/20 dark:bg-red-950/10" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-xs font-bold bg-primary/10">
                                  {user.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                {user.province && <p className="text-xs text-muted-foreground">📍 {user.province}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {user.role === "ADMIN" ? "🛡️ Admin" : user.role === "SELLER" ? "🏪 Vendedor" : "🛒 Comprador"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isBanned ? (
                              <Badge variant="destructive" className="text-xs gap-1"><Ban className="h-3 w-3" /> Banido</Badge>
                            ) : (
                              <Badge variant="default" className="text-xs gap-1"><CheckCircle className="h-3 w-3" /> Activo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-sm">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {user._count.products}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: dateLocale })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setBanReason(""); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {user.role !== "ADMIN" && (
                                user.isBanned ? (
                                  <Button variant="ghost" size="sm" onClick={() => handleBanUser(user.id, "unban")} title="Remover ban">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setBanReason(""); }} title="Banir utilizador">
                                    <Ban className="h-4 w-4 text-red-600" />
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ══════════════ REPORT DETAIL DIALOG ══════════════ */}
      <Dialog open={!!selectedReport} onOpenChange={() => { setSelectedReport(null); setReviewNotes(""); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Detalhes da Denúncia
            </DialogTitle>
            <DialogDescription>Reveja a denúncia e tome a acção adequada.</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</p>
                  <Badge variant="outline">{selectedReport.type === "PRODUCT" ? "📦 Produto" : "👤 Utilizador"}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</p>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data da Denúncia</p>
                  <p>{format(new Date(selectedReport.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: dateLocale })}</p>
                </div>
              </div>

              <Separator />

              {/* Reason & description */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Motivo</p>
                  <p className="text-sm font-semibold bg-muted px-3 py-2 rounded-md">{selectedReport.reason}</p>
                </div>
                {selectedReport.description && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Descrição adicional</p>
                    <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">{selectedReport.description}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* People involved */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Denunciante</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{selectedReport.reporter.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-xs">{selectedReport.reporter.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{selectedReport.reporter.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {selectedReport.type === "USER" ? "Utilizador Denunciado" : "Produto Denunciado"}
                  </p>
                  {selectedReport.type === "USER" && selectedReport.reportedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{selectedReport.reportedUser.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-xs">{selectedReport.reportedUser.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{selectedReport.reportedUser.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium">{selectedReport.reportedProduct?.title || "—"}</p>
                  )}
                </div>
              </div>

              {/* Review notes */}
              {selectedReport.status === "PENDING" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Notas de Revisão (opcional)
                    </Label>
                    <Textarea
                      placeholder="Adicione notas sobre esta denúncia..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReportAction(selectedReport.id, "DISMISSED", "NONE")} className="flex-1">
                      <XCircle className="h-4 w-4 mr-1 text-muted-foreground" /> Descartar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleReportAction(selectedReport.id, "REVIEWED", "NONE")} className="flex-1">
                      <Eye className="h-4 w-4 mr-1" /> Marcar como Revista
                    </Button>
                    {selectedReport.type === "PRODUCT" && selectedReport.reportedProduct && (
                      <Button variant="destructive" size="sm" onClick={() => handleReportAction(selectedReport.id, "RESOLVED", "DELETE_PRODUCT")} className="flex-1">
                        <Trash2 className="h-4 w-4 mr-1" /> Remover Produto
                      </Button>
                    )}
                    {selectedReport.type === "USER" && selectedReport.reportedUser && (
                      <Button variant="destructive" size="sm" onClick={() => handleReportAction(selectedReport.id, "RESOLVED", "BAN_USER")} className="flex-1">
                        <Ban className="h-4 w-4 mr-1" /> Banir Utilizador
                      </Button>
                    )}
                  </div>
                </>
              )}
              {selectedReport.status !== "PENDING" && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Esta denúncia já foi tratada ({STATUS_CONFIG[selectedReport.status]?.label || selectedReport.status}).</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════ USER DETAIL DIALOG ══════════════ */}
      <Dialog open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setBanReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Detalhes do Utilizador
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              {/* Avatar + info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-xl font-bold bg-primary/10">
                    {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{selectedUser.name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedUser.role === "ADMIN" ? "🛡️ Admin" : selectedUser.role === "SELLER" ? "🏪 Vendedor" : "🛒 Comprador"}
                    </Badge>
                    {selectedUser.isBanned && <Badge variant="destructive" className="text-xs">Banido</Badge>}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Produtos publicados</p>
                  <p className="font-bold">{selectedUser._count.products}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registado</p>
                  <p className="font-medium">{format(new Date(selectedUser.createdAt), "dd/MM/yyyy", { locale: dateLocale })}</p>
                </div>
                {selectedUser.province && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Província</p>
                    <p className="font-medium">📍 {selectedUser.province}</p>
                  </div>
                )}
              </div>

              {/* Change role */}
              {selectedUser.role !== "ADMIN" && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alterar Papel</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm" variant={selectedUser.role === "SELLER" ? "default" : "outline"} className="flex-1"
                        onClick={() => handleChangeRole(selectedUser.id, "SELLER")}
                        disabled={selectedUser.role === "SELLER"}
                      >
                        🏪 Vendedor
                      </Button>
                      <Button
                        size="sm" variant={selectedUser.role === "BUYER" ? "default" : "outline"} className="flex-1"
                        onClick={() => handleChangeRole(selectedUser.id, "BUYER")}
                        disabled={selectedUser.role === "BUYER"}
                      >
                        🛒 Comprador
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Ban section */}
              {selectedUser.role !== "ADMIN" && (
                <>
                  <Separator />
                  {selectedUser.isBanned ? (
                    <div className="space-y-3">
                      {selectedUser.bannedReason && (
                        <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm">
                          <p className="font-medium text-red-800 dark:text-red-400 mb-1">Motivo do ban:</p>
                          <p className="text-red-700 dark:text-red-500">{selectedUser.bannedReason}</p>
                        </div>
                      )}
                      <Button onClick={() => handleBanUser(selectedUser.id, "unban")} className="w-full" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Remover Ban
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Motivo do Ban *
                        </Label>
                        <Textarea
                          placeholder="Ex: Venda de produtos falsificados, fraude..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive" className="flex-1"
                          onClick={() => handleBanUser(selectedUser.id, "ban")}
                          disabled={!banReason.trim()}
                        >
                          <Ban className="h-4 w-4 mr-2" /> Banir Utilizador
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => handleDeleteUser(selectedUser.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar Conta
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
