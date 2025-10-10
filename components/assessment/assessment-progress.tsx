"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";

import { Progress } from "@/components/ui/progress";

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  timeElapsed?: number; // in seconds
  showScore?: boolean;
}

export const AssessmentProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  correctAnswers,
  timeElapsed,
  showScore = false 
}: AssessmentProgressProps) => {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const accuracy = currentQuestion > 0 ? (correctAnswers / currentQuestion) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-muted-foreground">
            Question {currentQuestion} of {totalQuestions}
          </span>
          {timeElapsed !== undefined && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Question Indicators */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNum = index + 1;
          const isCompleted = questionNum < currentQuestion;
          const isCurrent = questionNum === currentQuestion;
          const isUpcoming = questionNum > currentQuestion;

          return (
            <div
              key={index}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                transition-all duration-200
                ${isCompleted && "bg-green-500 text-white"}
                ${isCurrent && "bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900 scale-110"}
                ${isUpcoming && "bg-gray-200 dark:bg-gray-700 text-gray-500"}
              `}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                questionNum
              )}
            </div>
          );
        })}
      </div>

      {/* Score Display (if enabled) */}
      {showScore && currentQuestion > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Current Score</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {correctAnswers}/{currentQuestion}
              </span>
              <span className="text-sm text-muted-foreground">
                ({accuracy.toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">{correctAnswers} Correct</span>
            </div>
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Circle className="h-4 w-4" />
              <span className="text-sm font-medium">{currentQuestion - correctAnswers} Incorrect</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
