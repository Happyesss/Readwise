"use client";

import Link from "next/link";
import { 
  Award, 
  Clock, 
  Target,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Home,
  RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AssessmentResultsProps {
  assessmentTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  timeElapsed: number; // in seconds
  riskLevel: "low" | "moderate" | "high" | "very_high";
  skillBreakdown: {
    skillName: string;
    score: number;
    total: number;
    strength: "strong" | "developing" | "needs_support";
  }[];
  recommendations: string[];
  onRetake?: () => void;
}

export const AssessmentResults = ({
  assessmentTitle,
  totalQuestions,
  correctAnswers,
  timeElapsed,
  riskLevel,
  skillBreakdown,
  recommendations,
  onRetake
}: AssessmentResultsProps) => {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRiskConfig = (level: string) => {
    const configs = {
      low: {
        color: "green",
        icon: CheckCircle2,
        label: "Low Risk",
        message: "Great job! No significant concerns detected.",
        bgColor: "bg-green-50 dark:bg-green-950",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-700 dark:text-green-300"
      },
      moderate: {
        color: "yellow",
        icon: AlertTriangle,
        label: "Moderate Risk",
        message: "Some areas may benefit from additional support.",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        textColor: "text-yellow-700 dark:text-yellow-300"
      },
      high: {
        color: "orange",
        icon: AlertTriangle,
        label: "High Risk",
        message: "Several areas show signs that warrant attention.",
        bgColor: "bg-orange-50 dark:bg-orange-950",
        borderColor: "border-orange-200 dark:border-orange-800",
        textColor: "text-orange-700 dark:text-orange-300"
      },
      very_high: {
        color: "red",
        icon: XCircle,
        label: "Very High Risk",
        message: "Multiple areas indicate need for professional evaluation.",
        bgColor: "bg-red-50 dark:bg-red-950",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-700 dark:text-red-300"
      }
    };
    return configs[level as keyof typeof configs];
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "bg-green-500";
      case "developing":
        return "bg-yellow-500";
      case "needs_support":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Assessment Complete!</h1>
        <p className="text-lg text-muted-foreground">{assessmentTitle}</p>
      </div>

      {/* Overall Score Card */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score Circle */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - accuracy / 100)}`}
                    className={`${accuracy >= 70 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{accuracy.toFixed(0)}%</span>
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <p className="text-2xl font-bold text-red-600">{incorrectAnswers}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                    <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                    <p className="text-2xl font-bold text-purple-600">{formatTime(timeElapsed)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className={`border-2 ${riskConfig.borderColor}`}>
        <CardHeader className={riskConfig.bgColor}>
          <div className="flex items-center gap-3">
            <RiskIcon className={`h-8 w-8 ${riskConfig.textColor}`} />
            <div>
              <CardTitle className={riskConfig.textColor}>{riskConfig.label}</CardTitle>
              <p className={`text-sm ${riskConfig.textColor}`}>{riskConfig.message}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Skill Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <CardTitle>Skill Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillBreakdown.map((skill, index) => {
            const percentage = (skill.score / skill.total) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skill.skillName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(skill.strength)} text-white`}>
                      {skill.strength === "strong" ? "Strong" : skill.strength === "developing" ? "Developing" : "Needs Support"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {skill.score}/{skill.total} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-600" />
              <CardTitle>Recommendations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Link href="/learn">
          <Button variant="primary" size="lg" className="gap-2">
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Button>
        </Link>
        {onRetake && (
          <Button variant="primaryOutline" size="lg" onClick={onRetake} className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Retake Assessment
          </Button>
        )}
      </div>
    </div>
  );
};
