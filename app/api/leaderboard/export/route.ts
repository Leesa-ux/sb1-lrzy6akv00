import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const adminSecret = process.env.ADMIN_SECRET;

    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "json";
    const includeUnverified = url.searchParams.get("includeUnverified") === "true";

    const users = await db.user.findMany({
      where: includeUnverified
        ? {}
        : {
            phoneVerified: true,
          },
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        role: true,
        points: true,
        rank: true,
        phoneVerified: true,
        referralValidated: true,
        fraudScore: true,
        refCount: true,
        createdAt: true,
      },
      orderBy: {
        points: "desc",
      },
    });

    const exportData = users.map((user, index) => ({
      rank: index + 1,
      name: user.firstName || "Anonymous",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      points: user.points,
      referrals: user.refCount,
      phoneVerified: user.phoneVerified,
      referralValidated: user.referralValidated,
      fraudScore: user.fraudScore,
      createdAt: user.createdAt.toISOString(),
      eligibleForPrize: user.phoneVerified && user.fraudScore < 50,
    }));

    if (format === "csv") {
      const headers = [
        "Rank",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Points",
        "Referrals",
        "Phone Verified",
        "Referral Validated",
        "Fraud Score",
        "Created At",
        "Eligible for Prize",
      ];

      const rows = exportData.map((user) => [
        user.rank,
        user.name,
        user.email,
        user.phone,
        user.role,
        user.points,
        user.referrals,
        user.phoneVerified ? "Yes" : "No",
        user.referralValidated ? "Yes" : "No",
        user.fraudScore,
        user.createdAt,
        user.eligibleForPrize ? "Yes" : "No",
      ]);

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leaderboard-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      total: users.length,
      verifiedOnly: !includeUnverified,
      exportDate: new Date().toISOString(),
      users: exportData,
    });
  } catch (error) {
    console.error("Leaderboard export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
