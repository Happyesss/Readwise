"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { CustomSignupForm } from '@/components/auth/custom-signup-form';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/learn');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Create your account
          </h2>
        </div>

        <CustomSignupForm />
      </div>
    </div>
  );
}