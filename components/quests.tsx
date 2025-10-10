import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUESTS } from "@/constants";

type QuestsProps = { points: number };

export const Quests = ({ points }: QuestsProps) => {
  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="flex w-full items-center justify-between space-y-2">
        <h3 className="text-lg font-bold">Daily Quests</h3>

        <Link href="/quests">
          <Button size="sm" variant="primaryOutline">
            View all
          </Button>
        </Link>
      </div>

      <ul className="w-full space-y-4">
        {QUESTS.map((quest) => {
          const progress = Math.min((points / quest.value) * 100, 100);
          const isCompleted = points >= quest.value;

          return (
            <div
              className="flex w-full items-center gap-x-3 pb-4"
              key={quest.title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-2xl shadow-md">
                {quest.icon}
              </div>

              <div className="flex w-full flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-neutral-700">
                    {quest.title}
                  </p>
                  {isCompleted && (
                    <span className="text-xs font-semibold text-green-600">
                      ✓ Done!
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {quest.description}
                </p>

                <Progress value={progress} className="h-2" />
                
                <p className="text-xs text-muted-foreground">
                  {Math.min(points, quest.value)} / {quest.value} XP
                </p>
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
};
