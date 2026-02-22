import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const reportSchema = z.object({
  type: z.enum(["PRODUCT", "USER"]),
  reason: z.string().min(5, "O motivo deve ter pelo menos 5 caracteres"),
  description: z.string().optional(),
  reportedUserId: z.string().optional(),
  reportedProductId: z.string().optional(),
});

// Get reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";

    const where = status ? { status: status as any } : {};

    const reports = await db.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reportedUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        reportedProduct: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Falha ao buscar denúncias" },
      { status: 500 }
    );
  }
}

// Create a report
export async function POST(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();

    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // Validate that either product or user is being reported
    if (validatedData.type === "PRODUCT" && !validatedData.reportedProductId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    if (validatedData.type === "USER" && !validatedData.reportedUserId) {
      return NextResponse.json(
        { error: "ID do utilizador é obrigatório" },
        { status: 400 }
      );
    }

    // Check for duplicate reports
    const existingReport = await db.report.findFirst({
      where: {
        reporterId: user.id,
        type: validatedData.type,
        reportedProductId: validatedData.reportedProductId,
        reportedUserId: validatedData.reportedUserId,
        status: "PENDING",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "Já denunciou este item" },
        { status: 400 }
      );
    }

    const report = await db.report.create({
      data: {
        type: validatedData.type,
        reason: validatedData.reason,
        description: validatedData.description,
        reporterId: user.id,
        reportedUserId: validatedData.reportedUserId,
        reportedProductId: validatedData.reportedProductId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Falha ao criar denúncia" },
      { status: 500 }
    );
  }
}
