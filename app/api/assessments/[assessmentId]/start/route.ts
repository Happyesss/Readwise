import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth";
import db from "@/db/drizzle";
import { assessmentResults } from "@/db/schema";

export async function POST(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessmentId = parseInt(params.assessmentId);

    // Create assessment result record
    const [result] = await db
      .insert(assessmentResults)
      .values({
        userId,
        assessmentId,
        status: "in_progress",
        startedAt: new Date(),
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSESSMENT_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
