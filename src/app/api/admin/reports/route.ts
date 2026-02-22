import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateReportSchema = z.object({
  status: z.enum(["REVIEWED", "RESOLVED", "DISMISSED"]),
  reviewNotes: z.string().optional(),
  action: z.enum(["BAN_USER", "DELETE_PRODUCT", "NONE"]).optional(),
});

// Update report status (admin only)
export async function PUT(request: NextRequest) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        { error: "ID da denúncia é obrigatório" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateReportSchema.parse(body);

    const report = await db.report.findUnique({
      where: { id: reportId },
      include: {
        reportedProduct: true,
        reportedUser: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 });
    }

    // Take action based on the request
    if (validatedData.action === "BAN_USER" && report.reportedUser) {
      await db.user.update({
        where: { id: report.reportedUserId! },
        data: {
          isBanned: true,
          bannedReason: report.reason,
        },
      });
    }

    if (validatedData.action === "DELETE_PRODUCT" && report.reportedProduct) {
      await db.product.update({
        where: { id: report.reportedProductId! },
        data: { isActive: false },
      });
    }

    // Update report status
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        status: validatedData.status,
        reviewNotes: validatedData.reviewNotes,
        reviewedBy: admin.id,
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar denúncia" },
      { status: 500 }
    );
  }
}
