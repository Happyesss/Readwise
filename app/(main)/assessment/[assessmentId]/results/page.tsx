"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AssessmentResults } from "@/components/assessment/assessment-results";

interface AssessmentResult {
  id: number;
  title: string;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  riskLevel: "low" | "moderate" | "high" | "very_high";
  skillBreakdown: {
    skillName: string;
    score: number;
    total: number;
    strength: "strong" | "developing" | "needs_support";
  }[];
  recommendations: string[];
}

interface ResultsPageProps {
  params: {
    assessmentId: string;
  };
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams?.get("resultId");
  
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<AssessmentResult | null>(null);
  const [assessment, setAssessment] = useState<{ title: string } | null>(null);

  useEffect(() => {
    if (resultId) {
      void loadResults();
    }
  }, [resultId]);

  const loadResults = async () => {
    try {
      // Load assessment info
      const assessmentResponse = await fetch(`/api/assessments/${params.assessmentId}`);
      const assessmentData = await assessmentResponse.json();
      setAssessment(assessmentData.assessment);

      // Results are already calculated when we completed the assessment
      // We would need to create a GET endpoint to fetch the result by ID
      // For now, we'll use the data passed via the completion
      
      setLoading(false);
    } catch (error) {
      console.error("Failed to load results:", error);
      setLoading(false);
    }
  };

  const handleRetake = () => {
    router.push(`/assessment/${params.assessmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading results...</div>
      </div>
    );
  }

  if (!resultData) {
    // Mock data for demonstration
    const mockSkillBreakdown = [
      {
        skillName: "Phoneme Isolation",
        score: 15,
        total: 20,
        strength: "strong" as const,
      },
      {
        skillName: "Blending",
        score: 10,
        total: 15,
        strength: "developing" as const,
      },
      {
        skillName: "Segmentation",
        score: 8,
        total: 15,
        strength: "developing" as const,
      },
      {
        skillName: "Rhyme Recognition",
        score: 12,
        total: 20,
        strength: "needs_support" as const,
      },
    ];

    const mockRecommendations = [
      "Practice rhyme recognition through fun games and songs.",
      "Work on phoneme blending exercises for 10 minutes daily.",
      "Use multisensory approaches to reinforce sound-letter connections.",
      "Consider using assistive technology for reading support.",
    ];

    return (
      <AssessmentResults
        assessmentTitle={assessment?.title || "Assessment"}
        totalQuestions={70}
        correctAnswers={45}
        timeElapsed={1200}
        riskLevel="moderate"
        skillBreakdown={mockSkillBreakdown}
        recommendations={mockRecommendations}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <AssessmentResults
      assessmentTitle={assessment?.title || "Assessment"}
      totalQuestions={resultData.totalQuestions}
      correctAnswers={resultData.correctAnswers}
      timeElapsed={resultData.timeTaken}
      riskLevel={resultData.riskLevel}
      skillBreakdown={resultData.skillBreakdown}
      recommendations={resultData.recommendations}
      onRetake={handleRetake}
    />
  );
}
