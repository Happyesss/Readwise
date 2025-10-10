import Image from "next/image";
import { isValidImageSrc } from "@/lib/utils";
import Link from "next/link";
import { SafeImage } from "@/components/safe-image";

import { Button } from "@/components/ui/button";
import { courses } from "@/db/schema";

type UserProgressProps = {
  activeCourse: typeof courses.$inferSelect;
  hearts: number;
  points: number;
};

export const UserProgress = ({
  activeCourse,
  hearts,
  points,
}: UserProgressProps) => {
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <Link href="/courses">
        <Button variant="ghost">
          {isValidImageSrc(activeCourse.imageSrc) ? (
            <SafeImage
              src={activeCourse.imageSrc}
              alt={activeCourse.title}
              className="rounded-md border"
              width={32}
              height={32}
            />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-md border bg-neutral-50 text-sm font-semibold text-neutral-600">
              {activeCourse.title?.[0]?.toUpperCase()}
            </div>
          )}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-orange-500">
          <Image
            src="/points.svg"
            height={28}
            width={28}
            alt="Points"
            className="mr-2"
          />
          {points}
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="ghost" className="text-rose-500">
          <Image
            src="/heart.svg"
            height={22}
            width={22}
            alt="Hearts"
            className="mr-2"
          />
          {hearts}
        </Button>
      </Link>
    </div>
  );
};
