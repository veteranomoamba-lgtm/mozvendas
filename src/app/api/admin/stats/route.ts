import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get admin statistics
export async function GET(request: NextRequest) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    await requireAdmin();

    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalProducts,
      activeProducts,
      pendingReports,
      totalMessages,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "SELLER" } }),
      db.user.count({ where: { role: "BUYER" } }),
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
      db.report.count({ where: { status: "PENDING" } }),
      db.message.count(),
    ]);

    // Get recent activity
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const recentProducts = await db.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSellers,
        totalBuyers,
        totalProducts,
        activeProducts,
        pendingReports,
        totalMessages,
      },
      recentActivity: {
        recentUsers,
        recentProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Falha ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
