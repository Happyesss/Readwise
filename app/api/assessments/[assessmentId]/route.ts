import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { assessments, assessmentQuestions } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const assessmentId = parseInt(params.assessmentId);

    // Get assessment details
    const assessment = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessment.length) {
      return new NextResponse("Assessment not found", { status: 404 });
    }

    // Get questions for this assessment
    const questions = await db
      .select({
        id: assessmentQuestions.id,
        questionType: assessmentQuestions.questionType,
        content: assessmentQuestions.content,
        difficultyScore: assessmentQuestions.difficultyScore,
      })
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentId, assessmentId));

    return NextResponse.json({
      assessment: assessment[0],
      questions: questions,
    });
  } catch (error) {
    console.error("[ASSESSMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
