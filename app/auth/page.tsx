'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/learn')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-400 to-blue-500">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ReadWise</h1>
          <p className="mt-2 text-gray-600">Sign in to continue your language learning journey</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#22C55E',
                  brandAccent: '#16A34A',
                }
              }
            }
          }}
          providers={['google', 'github']}
          redirectTo={`${window.location.origin}/learn`}
        />
      </div>
    </div>
  )
}