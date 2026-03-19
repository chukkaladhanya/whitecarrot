"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Simple outline icons — eye-off when password is hidden, eye when visible (matches state, not “reverse”). */
function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.733 5.076a10.744 10.744 0 0111.205 6.575 1 1 0 01 0 .696 10.747 10.747 0 01-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 01-4.121-4.121" />
      <path d="M17.479 17.499a10.75 10.75 0 01-15.417-5.151 1 1 0 010-.696 10.75 10.75 0 014.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  /** Brief readOnly on mount stops many browsers from auto-filling a saved email into an “empty + placeholder” field. */
  const [userIdIgnoreAutofill, setUserIdIgnoreAutofill] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = requestAnimationFrame(() => setUserIdIgnoreAutofill(false));
    return () => cancelAnimationFrame(t);
  }, []);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload = isSignup
      ? {
          companyName: String(formData.get("companyName") ?? ""),
          userId: String(formData.get("userId") ?? ""),
          password: String(formData.get("password") ?? "")
        }
      : {
          companyName: String(formData.get("companyName") ?? ""),
          userId: String(formData.get("userId") ?? ""),
          password: String(formData.get("password") ?? "")
        };

    const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const raw = data?.error;
      let msg = "Request failed.";
      if (typeof raw === "string") {
        msg = raw;
      } else if (raw && typeof raw === "object") {
        // Zod flatten() shape: { formErrors: string[], fieldErrors: Record<string, string[] | undefined> }
        type ZodFlattenLike = {
          formErrors?: unknown;
          fieldErrors?: Record<string, unknown>;
        };
        const flattened = raw as ZodFlattenLike;
        const formErrors = flattened.formErrors;
        if (Array.isArray(formErrors) && formErrors.length) {
          msg = String(formErrors[0]);
        } else {
          const fieldErrors = flattened.fieldErrors as Record<string, unknown> | undefined;
          const firstFieldMsg = fieldErrors
            ? Object.values(fieldErrors)
                .flat()
                .filter(Boolean)[0]
            : undefined;
          if (firstFieldMsg) msg = String(firstFieldMsg);
        }
      } else if (raw != null) {
        msg = String(raw);
      }
      setError(msg);
      return;
    }

    router.push(`/${data.slug}/edit`);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl min-w-0 items-center gap-8 sm:gap-10 md:grid-cols-2 md:min-h-[calc(100vh-4rem)]">
        <section className="min-w-0 text-white md:pr-2">
          <p className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide text-slate-200">
            Careers Page Builder
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
            A cleaner way to manage hiring pages.
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Design branded careers pages, publish quickly, and keep the candidate experience simple.
          </p>
        </section>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-white p-5 shadow-2xl sm:p-6">
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${!isSignup ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${isSignup ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              Create account
            </button>
          </div>

          <h2 className="mb-1 text-xl font-semibold text-slate-900">{isSignup ? "Create account" : "Welcome back"}</h2>
          <p className="mb-4 text-sm text-slate-500">
            {isSignup ? "Set up your company workspace." : "Login to continue to your builder."}
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onSubmit(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            {isSignup ? (
              <>
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  name="companyName"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  required
                />
              </>
            ) : null}
            <label className="block text-sm font-medium text-slate-700">
              User ID
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-sky-50/80 px-3 py-2 outline-none focus:border-blue-500"
              name="userId"
              type="text"
              inputMode="email"
              autoComplete="username"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Enter your user ID or email"
              readOnly={userIdIgnoreAutofill}
              onFocus={() => setUserIdIgnoreAutofill(false)}
              required
            />
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-slate-300 bg-sky-50/80 px-3 py-2 pr-11 outline-none focus:border-blue-500"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                spellCheck={false}
                placeholder={isSignup ? "Choose a password" : "Enter your password"}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <IconEye className="shrink-0" /> : <IconEyeOff className="shrink-0" />}
              </button>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-70"
              disabled={loading}
              type="submit"
            >
              {loading ? "Please wait..." : isSignup ? "Sign up and continue" : "Login"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
