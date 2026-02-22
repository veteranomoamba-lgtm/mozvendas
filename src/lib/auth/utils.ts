import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Autenticação necessária");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Acesso de administrador necessário");
  return user;
}

export async function requireSeller() {
  const user = await requireAuth();
  if (user.role !== "SELLER" && user.role !== "ADMIN") throw new Error("Acesso de vendedor necessário");
  return user;
}

export async function checkOwnership(resourceOwnerId: string) {
  const user = await requireAuth();
  if (user.id !== resourceOwnerId && user.role !== "ADMIN") throw new Error("Sem permissão para este recurso");
  return true;
}

/**
 * Cria o utilizador admin inicial.
 * Requer ADMIN_EMAIL e ADMIN_PASSWORD nas variáveis de ambiente.
 * NUNCA coloque credenciais directamente no código!
 */
export async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn("⚠️  ADMIN_EMAIL ou ADMIN_PASSWORD não definidos.");
    return null;
  }

  const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) return existing;

  const hashed = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.create({
    data: { name: "Administrador", email: adminEmail, password: hashed, role: "ADMIN" },
  });
  console.log(`✅ Admin criado: ${adminEmail}`);
  return admin;
}
