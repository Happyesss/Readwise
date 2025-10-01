"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Props {
  redirectTo?: string;
}

export function CustomSignupForm({ redirectTo = "/learn" }: Props) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const cleanEmail = email.trim();
    try {
      // Basic client validation (mirrors GoTrue rules loosely)
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanEmail.split("@")[0] },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : undefined,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        if (data.session) {
          setInfo("Account created. Redirecting...");
          window.location.assign(redirectTo);
        } else {
          setInfo("Confirmation email sent. Please verify your inbox.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }, [email, password, redirectTo, supabase]);

  const oauth = async (provider: "google" | "github") => {
    setError(null);
    const { error: oError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}${redirectTo}` : undefined,
      },
    });
    if (oError) setError(oError.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => oauth("google")}
          className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Sign in with Google
        </button>
        <button
          type="button"
          onClick={() => oauth("github")}
          className="w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Sign in with Github
        </button>
      </div>
      <div className="h-px w-full bg-border" />
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Create a Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="••••••"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
            disabled={loading}
            className="w-full rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign up
        </button>
      </form>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md border border-purple-600 bg-purple-50 p-3 text-xs text-purple-700 dark:bg-purple-600/10 dark:text-purple-400">
          {info}
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Already have an account? <a href="/auth" className="underline">Sign in</a>
      </p>
    </div>
  );
}
