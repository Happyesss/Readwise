import { cache } from "react";
import db from "./drizzle";
import { assessments, assessmentQuestions, assessmentResults, assessmentResponses } from "./schema";
import { eq, and } from "drizzle-orm";

// Get all assessments
export const getAssessments = cache(async () => {
  return await db.select().from(assessments);
});

// Get assessment by ID
export const getAssessmentById = cache(async (assessmentId: number) => {
  const result = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  return result[0];
});

// Get assessment questions
export const getAssessmentQuestions = cache(async (assessmentId: number) => {
  return await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId));
});

// Get user's assessment results
export const getUserAssessmentResults = cache(async (userId: string) => {
  return await db.select().from(assessmentResults).where(eq(assessmentResults.userId, userId));
});

// Get specific assessment result
export const getAssessmentResult = cache(async (resultId: number) => {
  const result = await db.select().from(assessmentResults).where(eq(assessmentResults.id, resultId)).limit(1);
  return result[0];
});

// Create assessment result
export const createAssessmentResult = async (userId: string, assessmentId: number) => {
  const [result] = await db.insert(assessmentResults).values({
    userId,
    assessmentId,
    status: "in_progress",
    startedAt: new Date(),
  }).returning();
  
  return result;
};

// Submit question response
export const submitQuestionResponse = async (
  resultId: number,
  questionId: number,
  userAnswer: string,
  isCorrect: boolean,
  timeTaken: number
) => {
  const [response] = await db.insert(assessmentResponses).values({
    resultId,
    questionId,
    userAnswer,
    isCorrect,
    timeTaken,
    answeredAt: new Date(),
  }).returning();
  
  return response;
};

// Complete assessment
export const completeAssessment = async (
  resultId: number,
  scorePercentage: number,
  riskLevel: string
) => {
  const [result] = await db.update(assessmentResults)
    .set({
      scorePercentage,
      riskLevel,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(assessmentResults.id, resultId))
    .returning();
  
  return result;
};
