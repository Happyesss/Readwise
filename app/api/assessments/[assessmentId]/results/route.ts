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
    const { resultId } = body;

    // Get the assessment result
    const [result] = await db
      .select()
      .from(assessmentResults)
      .where(
        and(
          eq(assessmentResults.id, resultId),
          eq(assessmentResults.userId, userId)
        )
      )
      .limit(1);

    if (!result) {
      return new NextResponse("Result not found", { status: 404 });
    }

    // Calculate final score
    const scorePercentage = result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;

    // Determine risk level based on score and assessment type
    let riskLevel = "low";
    if (scorePercentage < 40) {
      riskLevel = "very_high";
    } else if (scorePercentage < 60) {
      riskLevel = "high";
    } else if (scorePercentage < 75) {
      riskLevel = "moderate";
    }

    // Update assessment result with final data
    const [updatedResult] = await db
      .update(assessmentResults)
      .set({
        scorePercentage,
        riskLevel,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(assessmentResults.id, resultId))
      .returning();

    // Get all responses for analysis
    const responses = await db
      .select({
        response: assessmentResponses,
        question: assessmentQuestions,
      })
      .from(assessmentResponses)
      .leftJoin(
        assessmentQuestions,
        eq(assessmentResponses.questionId, assessmentQuestions.id)
      )
      .where(eq(assessmentResponses.resultId, resultId));

    // Analyze by question type for skill breakdown
    const skillAnalysis: Record<string, { correct: number; total: number }> = {};
    
    responses.forEach(({ response, question }) => {
      if (!question) return;
      
      const type = question.questionType;
      if (!skillAnalysis[type]) {
        skillAnalysis[type] = { correct: 0, total: 0 };
      }
      
      skillAnalysis[type].total++;
      if (response.isCorrect) {
        skillAnalysis[type].correct++;
      }
    });

    // Generate recommendations based on weak areas
    const recommendations: string[] = [];
    Object.entries(skillAnalysis).forEach(([type, stats]) => {
      const percentage = (stats.correct / stats.total) * 100;
      if (percentage < 50) {
        const skillName = type.replace(/_/g, " ").toLowerCase();
        recommendations.push(
          `Focus on improving ${skillName} skills through targeted practice exercises.`
        );
      }
    });

    if (scorePercentage < 60) {
      recommendations.push(
        "Consider working with a reading specialist or educational therapist for personalized support."
      );
    }

    if (riskLevel !== "low") {
      recommendations.push(
        "Regular practice sessions (15-20 minutes daily) can help improve reading skills."
      );
    }

    return NextResponse.json({
      result: updatedResult,
      skillAnalysis,
      recommendations,
      responses: responses.length,
    });
  } catch (error) {
    console.error("[ASSESSMENT_COMPLETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assessmentId = parseInt(params.assessmentId);

    // Get all results for this assessment and user
    const results = await db
      .select()
      .from(assessmentResults)
      .where(
        and(
          eq(assessmentResults.assessmentId, assessmentId),
          eq(assessmentResults.userId, userId)
        )
      )
      .orderBy(assessmentResults.completedAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[ASSESSMENT_RESULTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
