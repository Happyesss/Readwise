"use server";

import { requireAuth, getUserId } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MAX_HEARTS, POINTS_TO_REFILL } from "@/constants";
import db, { fallbackMutations, supabaseClient, isPostgresAvailable } from "@/db/drizzle-enhanced";
import {
  getCourseById,
  getUserProgress,
} from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import type { Database } from "@/types/supabase";

export const upsertUserProgress = async (courseId: number) => {
  const user = await requireAuth();
  const userId = user.id;
  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (!userId || !user) throw new Error("Unauthorized.");

  const course = await getCourseById(courseId);

  if (!course) throw new Error("Course not found.");

  if (!course.units.length || !course.units[0].lessons.length)
    throw new Error("Course is empty.");

  const existingUserProgress = await getUserProgress();

  const profileName = profile?.full_name || user.user_metadata?.full_name || "User";
  const profileImage = profile?.avatar_url || user.user_metadata?.avatar_url || "/mascot.svg";

  if (existingUserProgress) {
    try {
      await db
        .update(userProgress)
        .set({
          activeCourseId: courseId,
          userName: profileName,
          userImageSrc: profileImage,
        })
        .where(eq(userProgress.userId, userId));
    } catch {
      await fallbackMutations.upsertUserProgress({
        userId,
        activeCourseId: courseId,
        userName: profileName,
        userImageSrc: profileImage,
      });
    }

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  try {
    await db.insert(userProgress).values({
      userId,
      activeCourseId: courseId,
      userName: profileName,
      userImageSrc: profileImage,
    });
  } catch {
    await fallbackMutations.upsertUserProgress({
      userId,
      activeCourseId: courseId,
      userName: profileName,
      userImageSrc: profileImage,
    });
  }

  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const user = await requireAuth();
  const userId = user.id;

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

  // Get challenge with fallback
  let challenge: any;
  try {
    if (isPostgresAvailable()) {
      challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
      });
    } else {
      throw new Error("PostgreSQL not available, using fallback");
    }
  } catch {
    if (!supabaseClient) throw new Error("No database connection available");
    
    const { data, error: supabaseError } = await supabaseClient
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();
    
    if (supabaseError) throw new Error("Challenge not found");
    challenge = data;
  }

  if (!challenge) throw new Error("Challenge not found.");

  const lessonId = challenge.lessonId || challenge.lesson_id; // Handle both naming conventions

  // Get existing challenge progress with fallback
  let existingChallengeProgress: any;
  try {
    if (isPostgresAvailable()) {
      existingChallengeProgress = await db.query.challengeProgress.findFirst({
        where: and(
          eq(challengeProgress.userId, userId),
          eq(challengeProgress.challengeId, challengeId)
        ),
      });
    } else {
      throw new Error("PostgreSQL not available, using fallback");
    }
  } catch {
    if (!supabaseClient) {
      existingChallengeProgress = null;
    } else {
      const { data } = await supabaseClient
        .from('challenge_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .maybeSingle();
      
      existingChallengeProgress = data;
    }
  }

  const isPractice = !!existingChallengeProgress;

  if (isPractice) return { error: "practice" };

  if (!currentUserProgress) throw new Error("User progress not found.");

  // Subscription functionality removed - users always lose hearts

  if (currentUserProgress.hearts === 0) return { error: "hearts" };

  const updatedHearts = Math.max(currentUserProgress.hearts - 1, 0);

  try {
    await db
      .update(userProgress)
      .set({
        hearts: updatedHearts,
      })
      .where(eq(userProgress.userId, userId));
  } catch {
    await fallbackMutations.updateHearts(userId, updatedHearts);
  }

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");
  if (currentUserProgress.hearts === MAX_HEARTS)
    throw new Error("Hearts are already full.");
  if (currentUserProgress.points < POINTS_TO_REFILL)
    throw new Error("Not enough points.");

  const updatedPoints = currentUserProgress.points - POINTS_TO_REFILL;

  try {
    await db
      .update(userProgress)
      .set({
        hearts: MAX_HEARTS,
        points: updatedPoints,
      })
      .where(eq(userProgress.userId, currentUserProgress.userId));
  } catch {
    await fallbackMutations.updateHeartsAndPoints(currentUserProgress.userId, MAX_HEARTS, updatedPoints);
  }

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
