import { Award, CheckCircle2, Lock } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Promo } from "@/components/promo";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Progress } from "@/components/ui/progress";
import { UserProgress } from "@/components/user-progress";
import { QUESTS } from "@/constants";
import { getUserProgress } from "@/db/queries";

const QuestsPage = async () => {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.activeCourse) redirect("/courses");

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
        />
        <Promo />
      </StickyWrapper>

      <FeedWrapper>
        <div className="flex w-full flex-col items-center">
          <Image src="/quests.svg" alt="Quests" height={90} width={90} />

          <h1 className="my-6 text-center text-2xl font-bold text-neutral-800">
            Daily Quests & Achievements
          </h1>
          <p className="mb-6 text-center text-lg text-muted-foreground">
            Complete quests to earn rewards and track your reading progress!
          </p>

          <ul className="w-full space-y-4">
            {QUESTS.map((quest, index) => {
              const progress = Math.min((userProgress.points / quest.value) * 100, 100);
              const isCompleted = userProgress.points >= quest.value;
              const isLocked = index > 0 && userProgress.points < QUESTS[index - 1].value;

              return (
                <div
                  className={`flex w-full items-center gap-x-4 rounded-xl border-2 p-6 transition-all ${
                    isCompleted 
                      ? "border-green-500 bg-green-50 dark:bg-green-950" 
                      : isLocked
                      ? "border-gray-200 bg-gray-50 dark:bg-gray-900 opacity-50"
                      : "border-blue-200 bg-blue-50 dark:bg-blue-950"
                  }`}
                  key={quest.title}
                >
                  {/* Quest Icon */}
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-lg ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-400 to-emerald-500"
                      : isLocked
                      ? "bg-gray-300"
                      : "bg-gradient-to-br from-blue-400 to-purple-500"
                  }`}>
                    {isCompleted ? "✓" : isLocked ? "🔒" : quest.icon}
                  </div>

                  <div className="flex flex-1 flex-col gap-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-neutral-700">
                        {quest.title}
                      </p>
                      {isCompleted && (
                        <div className="flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-semibold">Completed!</span>
                        </div>
                      )}
                      {isLocked && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm">Locked</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {quest.description}
                    </p>

                    <Progress value={progress} className="h-3" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">
                        {Math.min(userProgress.points, quest.value)} / {quest.value} XP
                      </span>
                      {isCompleted && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Award className="h-4 w-4" />
                          <span className="font-semibold">+{quest.value} Bonus</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </ul>

          {/* Progress Summary */}
          <div className="mt-8 w-full rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:from-purple-950 dark:to-pink-950">
            <h3 className="mb-4 text-xl font-bold">Your Progress</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-3xl font-bold text-purple-600">{userProgress.points}</p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
                <p className="text-sm text-muted-foreground">Quests Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {QUESTS.filter(q => userProgress.points >= q.value).length} / {QUESTS.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default QuestsPage;
