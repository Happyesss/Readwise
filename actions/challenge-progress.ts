"use server";

import { requireAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { MAX_HEARTS } from "@/constants";
import db, { supabaseClient, isPostgresAvailable } from "@/db/drizzle-enhanced";
import { getUserProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import type { Database } from "@/types/supabase";

export const upsertChallengeProgress = async (challengeId: number) => {
  const user = await requireAuth();
  const userId = user.id;

  if (!userId) throw new Error("Unauthorized.");

  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) throw new Error("User progress not found.");

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
  const useRest = !isPostgresAvailable();

  if (
    currentUserProgress.hearts === 0 &&
    !isPractice
  )
    return { error: "hearts" };

  if (isPractice) {
    if (useRest && supabaseClient) {
      await supabaseClient
        .from('challenge_progress')
        .update({ completed: true })
        .eq('id', existingChallengeProgress.id);
    } else {
      await db
        .update(challengeProgress)
        .set({ completed: true })
        .where(eq(challengeProgress.id, existingChallengeProgress.id));
    }

    if (useRest && supabaseClient) {
      await supabaseClient
        .from('user_progress')
        .update({
          hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
          points: currentUserProgress.points + 10,
        })
        .eq('user_id', userId);
    } else {
      await db
        .update(userProgress)
        .set({
          hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
          points: currentUserProgress.points + 10,
        })
        .where(eq(userProgress.userId, userId));
    }

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }

  if (useRest && supabaseClient) {
    await supabaseClient
      .from('challenge_progress')
      .insert({ challenge_id: challengeId, user_id: userId, completed: true });
  } else {
    await db.insert(challengeProgress).values({
      challengeId,
      userId,
      completed: true,
    });
  }

  if (useRest && supabaseClient) {
    await supabaseClient
      .from('user_progress')
      .update({ points: currentUserProgress.points + 10 })
      .eq('user_id', userId);
  } else {
    await db
      .update(userProgress)
      .set({ points: currentUserProgress.points + 10 })
      .where(eq(userProgress.userId, userId));
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
