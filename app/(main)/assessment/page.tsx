import { redirect } from "next/navigation";

import { AssessmentCard } from "@/components/assessment/assessment-card";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUser } from "@/lib/auth";

interface Assessment {
  id: number;
  title: string;
  assessmentType: string;
  description?: string;
  estimatedDuration?: number;
  difficultyLevel: number;
}

const getAssessments = async (): Promise<Assessment[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/assessments`, {
    cache: "no-store",
  });
  
  if (!response.ok) {
    return [];
  }
  
  return response.json();
};

const AssessmentsPage = async () => {
  const user = await getUser();

  if (!user) {
    redirect("/auth");
  }

  const assessments = await getAssessments();

  return (
    <div className="flex flex-row-reverse gap-12 px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={{ id: 0, title: "Dyslexia Support", imageSrc: "/learn.svg" }}
          hearts={5}
          points={0}
        />
        <Promo />
        <Quests points={0} />
      </StickyWrapper>
      
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <div className="space-y-4 w-full max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Reading Assessments</h1>
            
            <p className="text-muted-foreground mb-8">
              Take these assessments to identify your strengths and areas for improvement. 
              Each assessment focuses on specific reading skills.
            </p>

            <div className="grid gap-4">
              {assessments.map((assessment: Assessment) => (
                <AssessmentCard
                  key={assessment.id}
                  assessment={{
                    id: assessment.id,
                    name: assessment.title,
                    type: assessment.assessmentType,
                    description: assessment.description || "",
                    age_range_min: 5,
                    age_range_max: 12,
                    estimated_time_minutes: assessment.estimatedDuration || 20,
                    difficulty_level: assessment.difficultyLevel.toString(),
                  }}
                />
              ))}
            </div>

            {assessments.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No assessments available at this time.</p>
              </div>
            )}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default AssessmentsPage;
