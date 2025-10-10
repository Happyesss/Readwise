import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { getUserId } from "@/lib/auth";
import db from "@/db/drizzle";
import { assessmentResults, assessmentResponses, assessmentQuestions } from "@/db/schema";

export async function POST(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { resultId, questionId, userAnswer, timeTaken } = body;

    // Get the question to check correct answer
    const [question] = await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.id, questionId))
      .limit(1);

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();

    // Save the response
    const [response] = await db
      .insert(assessmentResponses)
      .values({
        resultId,
        questionId,
        userAnswer,
        isCorrect,
        timeTaken,
        answeredAt: new Date(),
      })
      .returning();

    // Update assessment result statistics
    const [currentResult] = await db
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.id, resultId))
      .limit(1);

    if (currentResult) {
      const newCorrectAnswers = currentResult.correctAnswers + (isCorrect ? 1 : 0);
      const newTotalQuestions = currentResult.totalQuestions + 1;

      await db
        .update(assessmentResults)
        .set({
          correctAnswers: newCorrectAnswers,
          totalQuestions: newTotalQuestions,
        })
        .where(eq(assessmentResults.id, resultId));
    }

    return NextResponse.json({
      ...response,
      isCorrect,
    });
  } catch (error) {
    console.error("[ASSESSMENT_ANSWER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
