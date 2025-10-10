"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "lucide-react";
import { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function MarketingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    void getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-8 p-4">
      {/* Hero Section */}
      <div className="flex w-full flex-col items-center justify-center gap-8 lg:flex-row lg:gap-16">
        <div className="relative mb-8 h-[240px] w-[240px] lg:mb-0 lg:h-[400px] lg:w-[400px]">
          <Image src="/hero.svg" alt="Hero" fill className="object-contain" />
        </div>

        <div className="flex flex-col items-center gap-y-8">
          <h1 className="max-w-[480px] text-center text-xl font-bold text-neutral-600 lg:text-3xl">
            Learn, practice and master reading skills with ReadWise - designed specially for children with dyslexia.
          </h1>

          <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
            {loading ? (
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/learn">Continue Learning</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>

                <Button size="lg" variant="primaryOutline" className="w-full" asChild>
                  <Link href="/sign-in">I already have an account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Character Gallery */}
      <div className="mt-12 w-full">
        <h2 className="mb-8 text-center text-2xl font-bold text-neutral-600">
          Meet Your Learning Companions
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/boy.svg" alt="Boy character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Alex</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-pink-50 to-pink-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/girl.svg" alt="Girl character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Emma</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-purple-50 to-purple-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/man.svg" alt="Man character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Marcus</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-purple-50 to-purple-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/woman.svg" alt="Woman character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Sofia</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-orange-50 to-orange-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/robot.svg" alt="Robot character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Robo</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-b from-teal-50 to-teal-100 p-4 transition-transform hover:scale-105">
            <div className="relative h-16 w-16">
              <Image src="/zombie.svg" alt="Zombie character" fill className="object-contain" />
            </div>
            <span className="text-sm font-medium text-neutral-600">Zack</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-12 w-full">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-16 w-16">
              <Image src="/learn.svg" alt="Learn" fill className="object-contain" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-700">Interactive Lessons</h3>
            <p className="text-sm text-neutral-600">
              Engage with fun, bite-sized lessons designed to help you learn effectively.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-16 w-16">
              <Image src="/heart.svg" alt="Hearts" fill className="object-contain" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-700">Progress Tracking</h3>
            <p className="text-sm text-neutral-600">
              Track your progress and maintain your learning streak every day.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-16 w-16">
              <Image src="/points.svg" alt="Points" fill className="object-contain" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-700">Earn Rewards</h3>
            <p className="text-sm text-neutral-600">
              Collect points and compete with friends on the leaderboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
