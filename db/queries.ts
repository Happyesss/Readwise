import { cache } from "react";

import { getUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

import db, { fallbackQueries, isPostgresAvailable } from "./drizzle-enhanced";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
} from "./schema";

const DAY_IN_MS = 86_400_000;

export const getCourses = cache(async () => {
  try {
    const data = await db.query.courses.findMany();
    return data;
  } catch (error) {
    return await fallbackQueries.getCourses();
  }
});

export const getUserProgress = cache(async () => {
  const userId = await getUserId();

  if (!userId) return null;

  try {
    const data = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
      },
    });
    return data;
  } catch (error) {
    try {
      return await fallbackQueries.getUserProgress(userId);
    } catch (fallbackError) {
      return null;
    }
  }
});

const getUserProgressInternal = async () => {
  const userId = await getUserId();
  const userProgress = await getUserProgress();
  return { userId, userProgress };
};

export const getUnits = cache(async () => {
  const { userId, userProgress } = await getUserProgressInternal();

  if (!userId || !userProgress?.activeCourseId) return [];

  try {
    const data = await db.query.units.findMany({
      orderBy: (units: any, { asc }: any) => [asc(units.order)],
      where: eq(units.courseId, userProgress.activeCourseId),
      with: {
        lessons: {
          orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
          with: {
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId),
                },
              },
            },
          },
        },
      },
    });

    const normalizedData = data.map((unit: any) => {
      const lessonsWithCompletedStatus = unit.lessons.map((lesson: any) => {
        if (lesson.challenges.length === 0) return { ...lesson, completed: false };

        const allCompletedChallenges = lesson.challenges.every((challenge: any) => {
          return (
            challenge.challengeProgress &&
            challenge.challengeProgress.length > 0 &&
            challenge.challengeProgress.every((progress: any) => progress.completed)
          );
        });

        return { ...lesson, completed: allCompletedChallenges };
      });

      return { ...unit, lessons: lessonsWithCompletedStatus };
    });

    return normalizedData;
  } catch (error) {
    // fallback
    
    // Fallback: Get units using simplified Supabase query
    try {
      return await fallbackQueries.getUnitsSimplified(userProgress.activeCourseId);
    } catch (fallbackError) {
      return [];
    }
  }
});

export const getCourseById = cache(async (courseId: number) => {
  try {
    const data = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units: any, { asc }: any) => [asc(units.order)],
          with: {
            lessons: {
              orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
            },
          },
        },
      },
    });

    return data;
  } catch (error) {
    return await fallbackQueries.getCourseById(courseId);
  }
});

export const getCourseProgress = cache(async () => {
  const userId = await getUserId();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress?.activeCourseId) return null;

  try {
    const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units: any, { asc }: any) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
    });

    const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit: any) => unit.lessons)
    .find((lesson: any) => {
      return lesson.challenges.some((challenge: any) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some((progress: any) => !progress.completed)
        );
      });
    });

    return {
      activeLesson: firstUncompletedLesson,
      activeLessonId: firstUncompletedLesson?.id,
    };
  } catch (error) {
    // fallback
    
    // Enhanced fallback: try to get course progress via Supabase REST API
    try {
      return await fallbackQueries.getCourseProgress(userId, userProgress.activeCourseId);
    } catch (fallbackError) {
      // Final fallback: return a default active lesson
      return {
        activeLesson: null,
        activeLessonId: 1, // Default to lesson 1
      };
    }
  }
});

export const getLesson = cache(async (id?: number) => {
  const userId = await getUserId();

  if (!userId) return null;

  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) return null;

  try {
    const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges: any, { asc }: any) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
    });

    if (!data || !data.challenges) return null;

    const normalizedChallenges = data.challenges.map((challenge: any) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress: any) => progress.completed);

    return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges };
  } catch (error) {
    // fallback
    
    // Enhanced fallback: try to get lesson via Supabase REST API
    try {
      return await fallbackQueries.getLesson(lessonId, userId);
    } catch (fallbackError) {
      return null;
    }
  }
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) return 0;

  const lesson = await getLesson(courseProgress?.activeLessonId);

  if (!lesson) return 0;

  const completedChallenges = lesson.challenges.filter(
    (challenge: any) => challenge.completed
  );

  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );

  return percentage;
});

export const getTopTenUsers = cache(async () => {
  const userId = await getUserId();

  if (!userId) return [];

  try {
    const data = await db.query.userProgress.findMany({
    orderBy: (userProgress: any, { desc }: any) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
    });
    return data;
  } catch (error) {
    return await fallbackQueries.getTopTenUsers();
  }
});
