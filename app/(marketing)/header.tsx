"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";

import Banner from "@/components/banner";
import { Button } from "@/components/ui/button";
import { links } from "@/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideBanner, setHideBanner] = useState(true);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Banner hide={hideBanner} setHide={setHideBanner} />

      <header
        className={cn(
          "h-20 w-full border-b-2 border-slate-200 px-4",
          !hideBanner ? "mt-20 sm:mt-16 lg:mt-10" : "mt-0"
        )}
      >
        <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
          <Link href="/" className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
            <Image src="/mascot.svg" alt="Mascot" height={40} width={40} />

            <h1 className="text-2xl font-extrabold tracking-wide text-purple-600">
              ReadWise
            </h1>
          </Link>

          <div className="flex gap-x-3">
            {loading ? (
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                {user ? (
                  <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500">
                        <span className="text-xs font-medium text-white">
                          {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleSignOut()}
                        className="h-8 px-2"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link href="/sign-in">
                    <Button size="lg" variant="ghost">
                      Login
                    </Button>
                  </Link>
                )}

                {links.sourceCode && (
                  <Link
                    href={links.sourceCode}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={user ? "pt-1.5" : "pt-3"}
                  >
                    <Image
                      src="/github.svg"
                      alt="Source Code"
                      height={20}
                      width={20}
                    />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
