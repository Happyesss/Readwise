import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { assessments } from "@/db/schema";

export async function GET() {
  try {
    const data = await db
      .select({
        id: assessments.id,
        title: assessments.title,
        description: assessments.description,
        assessmentType: assessments.assessmentType,
        targetSkills: assessments.targetSkills,
        difficultyLevel: assessments.difficultyLevel,
        estimatedDuration: assessments.estimatedDuration,
        questionCount: assessments.questionCount,
        passingScore: assessments.passingScore,
      })
      .from(assessments)
      .orderBy(assessments.difficultyLevel);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[ASSESSMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
