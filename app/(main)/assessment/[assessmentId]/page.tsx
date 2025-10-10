"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestion } from "@/components/assessment/question-renderer";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  questionType: string;
  content: {
    instruction: string;
    choices: string[];
    word?: string;
    words?: string[];
    phonemes?: string[];
    image?: string;
    audio?: string;
    type?: string;
    position?: string;
  };
  difficultyScore: number;
}

interface AssessmentData {
  id: number;
  title: string;
  description?: string;
  questions: Question[];
}

interface AssessmentPageProps {
  params: {
    assessmentId: string;
  };
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [resultId, setResultId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    void loadAssessment();
  }, [params.assessmentId]);

  const loadAssessment = async () => {
    try {
      // Load assessment and questions
      const response = await fetch(`/api/assessments/${params.assessmentId}`);
      const data = await response.json();
      
      setAssessment(data.assessment);
      setQuestions(data.questions);
      
      // Parse content JSON for each question
      const parsedQuestions = data.questions.map((q: Question) => ({
        ...q,
        content: typeof q.content === 'string' ? JSON.parse(q.content as string) : q.content,
      }));
      setQuestions(parsedQuestions);

      // Start assessment
      const startResponse = await fetch(`/api/assessments/${params.assessmentId}/start`, {
        method: "POST",
      });
      const startData = await startResponse.json();
      setResultId(startData.id as number);
      setStartTime(new Date());
      setQuestionStartTime(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Failed to load assessment:", error);
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!resultId || !questionStartTime) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);

    try {
      // Submit answer
      const response = await fetch(`/api/assessments/${params.assessmentId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId,
          questionId: currentQuestion.id,
          userAnswer: answer,
          timeTaken,
        }),
      });

      const data = await response.json();

      if (data.isCorrect) {
        setCorrectAnswers(correctAnswers + 1);
      }

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(new Date());
        setShowHint(false);
      } else {
        // Assessment complete
        void finishAssessment();
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const finishAssessment = async () => {
    if (!resultId || !startTime) return;

    const totalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      const response = await fetch(`/api/assessments/${params.assessmentId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resultId,
          timeTaken: totalTime,
        }),
      });

      // Navigate to results page
      router.push(`/assessment/${params.assessmentId}/results?resultId=${resultId}`);
    } catch (error) {
      console.error("Failed to finish assessment:", error);
    }
  };

  const currentTimeElapsed = startTime 
    ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading assessment...</div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">No questions available for this assessment.</p>
        <Link href="/assessment">
          <Button variant="primary">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/assessment">
                <Button variant="ghost" size="sm" className="gap-2">
                  <X className="h-4 w-4" />
                  Exit
                </Button>
              </Link>
              <h2 className="text-xl font-bold">{assessment?.title}</h2>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
            >
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AssessmentProgress
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          correctAnswers={correctAnswers}
          timeElapsed={currentTimeElapsed}
          showScore={false}
        />
      </div>

      {/* Question */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AssessmentQuestion
          question={{
            id: currentQuestion.id,
            question_type: currentQuestion.questionType,
            content: currentQuestion.content,
            difficulty_score: currentQuestion.difficultyScore,
          }}
          onAnswerAction={handleAnswer}
          showHint={showHint}
        />
      </div>
    </div>
  );
}
