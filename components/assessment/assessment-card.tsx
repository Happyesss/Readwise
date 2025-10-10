"use client";

import Link from "next/link";
import { Clock, Brain, Zap, BookOpen, MessageSquare, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Assessment {
  id: number;
  name: string;
  type: string;
  description: string;
  age_range_min: number;
  age_range_max: number;
  estimated_time_minutes: number;
  difficulty_level: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  userProgress?: {
    completed: boolean;
    score?: number;
    lastAttempt?: Date;
  };
}

const getAssessmentIcon = (type: string) => {
  switch (type) {
    case "phonological":
      return Brain;
    case "rapid_naming":
      return Zap;
    case "working_memory":
      return Target;
    case "reading_fluency":
      return BookOpen;
    case "spelling":
      return MessageSquare;
    default:
      return Brain;
  }
};

const getAssessmentColor = (type: string) => {
  switch (type) {
    case "phonological":
      return "from-blue-500 to-cyan-500";
    case "rapid_naming":
      return "from-yellow-500 to-orange-500";
    case "working_memory":
      return "from-purple-500 to-pink-500";
    case "reading_fluency":
      return "from-green-500 to-emerald-500";
    case "spelling":
      return "from-red-500 to-rose-500";
    default:
      return "from-gray-500 to-slate-500";
  }
};

export const AssessmentCard = ({ assessment, userProgress }: AssessmentCardProps) => {
  const Icon = getAssessmentIcon(assessment.type);
  const colorClass = getAssessmentColor(assessment.type);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with gradient */}
      <div className={`h-32 bg-gradient-to-br ${colorClass} p-6 flex items-center justify-between`}>
        <div className="text-white">
          <h3 className="text-2xl font-bold mb-1">{assessment.name}</h3>
          <p className="text-white/90 text-sm">
            Ages {assessment.age_range_min}-{assessment.age_range_max}
          </p>
        </div>
        <Icon className="h-16 w-16 text-white/30" />
      </div>

      <CardContent className="p-6">
        {/* Description */}
        <p className="text-muted-foreground mb-4">
          {assessment.description}
        </p>

        {/* Assessment Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Estimated time: {assessment.estimated_time_minutes} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>Difficulty: {assessment.difficulty_level}</span>
          </div>
        </div>

        {/* Progress (if available) */}
        {userProgress && userProgress.completed && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed
              </span>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                {userProgress.score}%
              </span>
            </div>
            <Progress value={userProgress.score} className="h-2" />
            {userProgress.lastAttempt && (
              <p className="text-xs text-muted-foreground mt-2">
                Last attempt: {new Date(userProgress.lastAttempt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/assessment/${assessment.id}`} className="flex-1">
            <Button variant="primary" className="w-full">
              {userProgress?.completed ? "Retake Assessment" : "Start Assessment"}
            </Button>
          </Link>
          {userProgress?.completed && (
            <Link href={`/assessment/${assessment.id}/results`}>
              <Button variant="primaryOutline">
                View Results
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
