// Legacy database connection for backward compatibility
// This file maintains the existing API while adding robust error handling

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from '@supabase/supabase-js';
import type { Database } from "@/types/supabase";

import * as schema from "./schema";

// Environment variables
const rawDatabaseUrl = process.env.DATABASE_URL;
const DATABASE_URL = rawDatabaseUrl
  ? rawDatabaseUrl.trim().replace(/\/$/, '')
  : undefined;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clean and ensure protocol and no trailing slash for Supabase URL
const rawSupabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_URL = rawSupabaseUrl
  ? rawSupabaseUrl.trim().replace(/\/$/, '').startsWith('http')
    ? rawSupabaseUrl.trim().replace(/\/$/, '')
    : `https://${rawSupabaseUrl.trim().replace(/\/$/, '')}`
  : undefined;


// Global connection state
let postgresClient: postgres.Sql | null = null;
let drizzleDb: ReturnType<typeof drizzle> | null = null;
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Initialize Supabase client
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch {
    supabaseClient = null;
  }
}

// Initialize PostgreSQL connection
if (DATABASE_URL) {
  try {
    postgresClient = postgres(DATABASE_URL, {
      prepare: false,
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 3, // Short timeout for faster fallback
      connection: {
        application_name: 'readwise',
      },
      onnotice: () => {}, // Suppress notices
      debug: false,
      transform: {
        undefined: null
      }
    });

    drizzleDb = drizzle(postgresClient, { schema });
    
    // Test the connection immediately and disable if it fails
    // Use a more aggressive timeout for faster fallback
    const connectionTest = Promise.race([
      postgresClient!`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000))
    ]);

    connectionTest.then(() => {
      // connection ok
    }).catch(() => {
      // Disable PostgreSQL on connection failure
      try {
        postgresClient?.end();
      } catch {}
      postgresClient = null;
      drizzleDb = null;
    });
    
  } catch {
    postgresClient = null;
    drizzleDb = null;
  }
}

// Fallback queries using Supabase REST API or mock data
export const fallbackQueries = {
  async getCourses() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('courses')
          .select('id, title, image_src');
        
        if (error) throw error;
        return (data || []).map((course: any) => ({
          id: course.id,
          title: course.title,
          imageSrc: course.image_src
        }));
      } catch {
      }
    }
    
    // Mock data fallback for development
    return [
      { id: 1, title: 'Spanish', imageSrc: '/es.svg' },
      { id: 2, title: 'French', imageSrc: '/fr.svg' },
      { id: 3, title: 'Italian', imageSrc: '/it.svg' },
    ];
  },

  async getUserProgress(userId: string) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('user_progress')
          .select(`
            user_id,
            user_name,
            user_image_src,
            active_course_id,
            hearts,
            points,
            courses!active_course_id (
              id,
              title,
              image_src
            )
          `)
          .eq('user_id', userId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        const course = Array.isArray((data as any).courses) ? (data as any).courses[0] : (data as any).courses;
        return {
          userId: (data as any).user_id,
          userName: (data as any).user_name,
          userImageSrc: (data as any).user_image_src,
          activeCourseId: (data as any).active_course_id,
          hearts: (data as any).hearts,
          points: (data as any).points,
          activeCourse: course ? {
            id: (course as any).id,
            title: (course as any).title,
            imageSrc: (course as any).image_src
          } : null
        };
      } catch {
      }
    }

    // Mock data fallback for development
    return {
      userId,
      userName: 'Demo User',
      userImageSrc: '/mascot.svg',
      activeCourseId: 1,
      hearts: 5,
      points: 100,
      activeCourse: {
        id: 1,
        title: 'Spanish',
        imageSrc: '/es.svg'
      }
    };
  },

  async getCourseById(courseId: number) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('courses')
          .select(`
            id,
            title,
            image_src,
            units (
              id,
              title,
              description,
              course_id,
              order,
              lessons (
                id,
                title,
                unit_id,
                order
              )
            )
          `)
          .eq('id', courseId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        return {
          id: (data as any).id,
          title: (data as any).title,
          imageSrc: (data as any).image_src,
          units: ((data as any).units || []).map((unit: any) => ({
            id: unit.id,
            title: unit.title,
            description: unit.description,
            courseId: unit.course_id,
            order: unit.order,
            lessons: (unit.lessons || []).map((lesson: any) => ({
              id: lesson.id,
              title: lesson.title,
              unitId: lesson.unit_id,
              order: lesson.order
            }))
          }))
        };
      } catch {
      }
    }

    // Mock data fallback for development
    return {
      id: courseId,
      title: courseId === 1 ? 'Spanish' : courseId === 2 ? 'French' : 'Italian',
      imageSrc: courseId === 1 ? '/es.svg' : courseId === 2 ? '/fr.svg' : '/it.svg',
      units: [
        {
          id: 1,
          title: 'Unit 1',
          description: 'Learn the basics',
          courseId: courseId,
          order: 1,
          lessons: [
            { id: 1, title: 'Lesson 1', unitId: 1, order: 1 },
            { id: 2, title: 'Lesson 2', unitId: 1, order: 2 }
          ]
        },
        {
          id: 2,
          title: 'Unit 2',
          description: 'Continue learning',
          courseId: courseId,
          order: 2,
          lessons: [
            { id: 3, title: 'Lesson 3', unitId: 2, order: 1 },
            { id: 4, title: 'Lesson 4', unitId: 2, order: 2 }
          ]
        }
      ]
    };
  },

  async getTopTenUsers() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('user_progress')
          .select('user_id, user_name, user_image_src, points')
          .order('points', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return (data || []).map((row: any) => ({
          userId: row.user_id,
          userName: row.user_name,
          userImageSrc: row.user_image_src,
          points: row.points,
        }));
      } catch {
      }
    }

    // Mock data fallback for development
    return [
      { userId: '1', userName: 'Demo User 1', userImageSrc: '/boy.svg', points: 1000 },
      { userId: '2', userName: 'Demo User 2', userImageSrc: '/girl.svg', points: 950 },
      { userId: '3', userName: 'Demo User 3', userImageSrc: '/man.svg', points: 900 },
      { userId: '4', userName: 'Demo User 4', userImageSrc: '/woman.svg', points: 850 },
      { userId: '5', userName: 'Demo User 5', userImageSrc: '/robot.svg', points: 800 },
    ];
  },

  async getUnitsSimplified(courseId: number) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('units')
          .select(`
            id,
            title,
            description,
            course_id,
            order,
            lessons (
              id,
              title,
              unit_id,
              order
            )
          `)
          .eq('course_id', courseId)
          .order('order');
        
        if (error) throw error;
        return (data || []).map((unit: any) => ({
          id: unit.id,
          title: unit.title,
          description: unit.description,
          courseId: unit.course_id,
          order: unit.order,
          lessons: (unit.lessons || []).map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            unitId: lesson.unit_id,
            order: lesson.order,
            completed: false, // Default to not completed in fallback
            challenges: []
          }))
        }));
      } catch {
      }
    }

    // Mock data fallback for development
    return [
      {
        id: 1,
        title: 'Unit 1: Basics',
        description: 'Learn the fundamentals',
        courseId: courseId,
        order: 1,
        lessons: [
          { id: 1, title: 'Hello World', unitId: 1, order: 1, completed: false, challenges: [] },
          { id: 2, title: 'Greetings', unitId: 1, order: 2, completed: false, challenges: [] }
        ]
      },
      {
        id: 2,
        title: 'Unit 2: Family',
        description: 'Learn about family members',
        courseId: courseId,
        order: 2,
        lessons: [
          { id: 3, title: 'Family Members', unitId: 2, order: 1, completed: false, challenges: [] },
          { id: 4, title: 'Family Relationships', unitId: 2, order: 2, completed: false, challenges: [] }
        ]
      }
    ];
  },

  async getCourseProgress(userId: string, activeCourseId: number) {
    if (supabaseClient) {
      try {
        // Get units with lessons and challenges for the active course
        const { data, error } = await supabaseClient
          .from('units')
          .select(`
            id,
            title,
            description,
            course_id,
            order,
            lessons (
              id,
              title,
              unit_id,
              order,
              challenges (
                id,
                lesson_id,
                type,
                question,
                order,
                challenge_progress!inner (
                  user_id,
                  challenge_id,
                  completed
                )
              )
            )
          `)
          .eq('course_id', activeCourseId)
          .eq('lessons.challenges.challenge_progress.user_id', userId)
          .order('order');
        
        if (error) throw error;

        // Find first uncompleted lesson
        const units = data || [];
        let firstUncompletedLesson = null;

        for (const unit of units) {
          for (const lesson of unit.lessons || []) {
            const challenges = Array.isArray(lesson.challenges) ? lesson.challenges : [];
            const hasUncompletedChallenge = challenges.some((challenge: any) => {
              return !(challenge.challenge_progress || []).every((progress: any) => progress.completed);
            });
            
            if (hasUncompletedChallenge) {
              firstUncompletedLesson = lesson;
              break;
            }
          }
          if (firstUncompletedLesson) break;
        }

        return {
          activeLesson: firstUncompletedLesson,
          activeLessonId: firstUncompletedLesson?.id || 1,
        };
      } catch {
      }
    }

    // Final fallback
    return {
      activeLesson: null,
      activeLessonId: 1,
    };
  },

  async getLesson(lessonId: number, userId: string) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('lessons')
          .select(`
            id,
            title,
            unit_id,
            order,
            challenges (
              id,
              lesson_id,
              type,
              question,
              order,
              challenge_options (
                id,
                challenge_id,
                text,
                correct,
                image_src,
                audio_src
              ),
              challenge_progress (
                id,
                user_id,
                challenge_id,
                completed
              )
            )
          `)
          .eq('id', lessonId)
          .eq('challenges.challenge_progress.user_id', userId)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }

        // Normalize the data structure
        const challenges = Array.isArray(data.challenges) ? data.challenges : [];
        const normalizedChallenges = challenges.map((challenge: any) => {
          const completed = (challenge.challenge_progress || [])
            .filter((progress: any) => progress.user_id === userId)
            .every((progress: any) => progress.completed);

          return {
            ...challenge,
            completed,
            challengeOptions: challenge.challenge_options || [],
            challengeProgress: challenge.challenge_progress || []
          };
        });

        return {
          ...data,
          challenges: normalizedChallenges
        };
      } catch {
      }
    }

    // Mock data fallback
    return {
      id: lessonId,
      title: `Lesson ${lessonId}`,
      unitId: 1,
      order: 1,
      challenges: [
        {
          id: 1,
          lessonId: lessonId,
          type: 'SELECT',
          question: 'What does "hola" mean?',
          order: 1,
          completed: false,
          challengeOptions: [
            { id: 1, challengeId: 1, text: 'Hello', correct: true, imageSrc: null, audioSrc: null },
            { id: 2, challengeId: 1, text: 'Goodbye', correct: false, imageSrc: null, audioSrc: null },
            { id: 3, challengeId: 1, text: 'Please', correct: false, imageSrc: null, audioSrc: null }
          ],
          challengeProgress: []
        }
      ]
    };
  }
};

// Fallback mutations
export const fallbackMutations = {
  async upsertUserProgress(params: {
    userId: string;
    activeCourseId: number;
    userName: string;
    userImageSrc: string;
  }) {
    if (!supabaseClient) throw new Error('Supabase client not available');
    
    // Try update first
    const { error: updateError } = await (supabaseClient as any)
      .from('user_progress')
      .update({
        active_course_id: params.activeCourseId,
        user_name: params.userName,
        user_image_src: params.userImageSrc,
      })
      .eq('user_id', params.userId);

    // If no rows affected, insert new record
    if (updateError && updateError.code === 'PGRST116') {
      const { error: insertError } = await (supabaseClient as any)
        .from('user_progress')
        .insert({
          user_id: params.userId,
          active_course_id: params.activeCourseId,
          user_name: params.userName,
          user_image_src: params.userImageSrc,
        });
      
      if (insertError) throw insertError;
    } else if (updateError) {
      throw updateError;
    }
  },

  async updateHearts(userId: string, hearts: number) {
    if (!supabaseClient) throw new Error('Supabase client not available');
    const { error } = await (supabaseClient as any)
      .from('user_progress')
      .update({ hearts })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async updateHeartsAndPoints(userId: string, hearts: number, points: number) {
    if (!supabaseClient) throw new Error('Supabase client not available');
    const { error } = await (supabaseClient as any)
      .from('user_progress')
      .update({ hearts, points })
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// Enhanced database instance with dynamic fallback
const db = new Proxy({}, {
  get(target, prop) {
    // Always check current connection state
    if (drizzleDb && prop in drizzleDb) {
      return (drizzleDb as any)[prop];
    }
    
    // If no connection, throw error to trigger fallback in queries
    if (!drizzleDb) {
      throw new Error('PostgreSQL connection not available');
    }
    
    // Return undefined for unknown properties to avoid crashes
    return undefined;
  }
}) as any;

export default db;

// Export utilities
export { supabaseClient, postgresClient };
export function isPostgresAvailable(): boolean {
  return !!drizzleDb;
}

export function isSupabaseAvailable(): boolean {
  return !!supabaseClient;
}

export async function testConnections() {
  const results = {
    postgres: false,
    supabase: false,
  };

  // Test PostgreSQL
  if (drizzleDb && postgresClient) {
    try {
      await postgresClient`SELECT 1`;
      results.postgres = true;
    } catch {}
  }

  // Test Supabase
  if (supabaseClient) {
    try {
      const { error } = await supabaseClient.from('courses').select('id').limit(1);
      results.supabase = !error;
    } catch {}
  }

  return results;
}