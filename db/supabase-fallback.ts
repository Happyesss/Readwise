// Alternative database queries using Supabase REST API
// Use this when direct PostgreSQL connection fails
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Direct REST API calls as fallback for Drizzle queries
export const fallbackQueries = {
  getCourses: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title, image_src')
    
    if (error) {
      throw error
    }
    
    return data || []
  },

  getUserProgress: async (userId: string) => {
    const { data, error } = await supabase
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
      .single()
    
    if (error) {
      return null
    }

    // Transform to match Drizzle schema format
    const course = Array.isArray(data.courses) ? data.courses[0] : data.courses
    return {
      userId: data.user_id,
      userName: data.user_name,
      userImageSrc: data.user_image_src,
      activeCourseId: data.active_course_id,
      hearts: data.hearts,
      points: data.points,
      activeCourse: course || null
    }
  },

  getCourseById: async (courseId: number) => {
    const { data, error } = await supabase
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
      .single()
    
    if (error) {
      return null
    }

    // Transform to match Drizzle schema format
    return {
      id: data.id,
      title: data.title,
      imageSrc: data.image_src,
      units: data.units?.map((unit: any) => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        courseId: unit.course_id,
        order: unit.order,
        lessons: unit.lessons?.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          unitId: lesson.unit_id,
          order: lesson.order
        })) || []
      })) || []
    }
  },

  getTopTenUsers: async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        user_name,
        user_image_src,
        points
      `)
      .order('points', { ascending: false })
      .limit(10)

    if (error) {
      return []
    }

    return (data || []).map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      userImageSrc: row.user_image_src,
      points: row.points,
    }))
  }
}

export const fallbackMutations = {
  updateUserProgress: async (params: {
    userId: string
    activeCourseId: number
    userName: string
    userImageSrc: string
  }) => {
    const { error } = await supabase
      .from('user_progress')
      .update({
        active_course_id: params.activeCourseId,
        user_name: params.userName,
        user_image_src: params.userImageSrc,
      })
      .eq('user_id', params.userId)

    if (error) {
      throw error
    }
  },

  insertUserProgress: async (params: {
    userId: string
    activeCourseId: number
    userName: string
    userImageSrc: string
  }) => {
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: params.userId,
        active_course_id: params.activeCourseId,
        user_name: params.userName,
        user_image_src: params.userImageSrc,
      })

    if (error) {
      throw error
    }
  },

  updateHearts: async (params: { userId: string; hearts: number }) => {
    const { error } = await supabase
      .from('user_progress')
      .update({
        hearts: params.hearts,
      })
      .eq('user_id', params.userId)

    if (error) {
      throw error
    }
  },

  updateHeartsAndPoints: async (params: {
    userId: string
    hearts: number
    points: number
  }) => {
    const { error } = await supabase
      .from('user_progress')
      .update({
        hearts: params.hearts,
        points: params.points,
      })
      .eq('user_id', params.userId)

    if (error) {
      throw error
    }
  },
}

export default supabase