import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import api, { getErrorMessage } from "@/api/axios";
import AuthLayout from "@/components/AuthLayout";
import { Icon } from "@/components/Icon";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

const stepCopy: Record<Step, { title: string; subtitle: string }> = {
  1: {
    title: "Reset your password",
    subtitle: "Enter your account email and we'll send a verification code.",
  },
  2: {
    title: "Enter the verification code",
    subtitle: "Check your inbox for a 6-digit code. It expires in 10 minutes.",
  },
  3: {
    title: "Set a new password",
    subtitle: "Choose a strong password you haven't used before.",
  },
  4: {
    title: "Password updated",
    subtitle: "Your password has been reset successfully.",
  },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    const { data } = await api.post<{ message: string; dev_code?: string }>("/forgot-password", {
      email: email.trim(),
    });
    setDevCode(data.dev_code ?? null);
    setNotice(data.message);
  };

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestCode();
      setStep(2);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<{ valid: boolean }>("/verify-code", {
        email: email.trim(),
        code: code.trim(),
      });

      if (!data.valid) {
        setError("That code is invalid or has expired. Request a new one and try again.");
        return;
      }

      setStep(3);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/reset-password", {
        email: email.trim(),
        code: code.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      setStep(4);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);

    try {
      await requestCode();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const copy = stepCopy[step];

  return (
    <AuthLayout
      title={copy.title}
      subtitle={step === 2 ? `We sent a code to ${email}.` : copy.subtitle}
      footer={
        step === 4 ? null : (
          <>
            Remembered it?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Back to sign in
            </Link>
          </>
        )
      }
    >
      {step < 4 ? (
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  item < step
                    ? "bg-emerald-500 text-white"
                    : item === step
                      ? "bg-brand-600 text-white"
                      : "bg-slate-200 text-slate-500",
                )}
              >
                {item < step ? <Icon name="check" size={13} strokeWidth={3} /> : item}
              </span>
              {item < 3 ? (
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    item < step ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
        >
          <Icon name="alert" size={17} className="mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      {step === 2 && notice ? (
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="mail" size={16} />
            {notice}
          </p>
          {devCode ? (
            <p className="mt-1.5 text-xs text-brand-700">
              Development mode code:{" "}
              <span className="rounded bg-white px-1.5 py-0.5 font-mono text-sm font-bold tracking-widest text-brand-800">
                {devCode}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-4" noValidate>
          <Input
            label="Email address"
            name="email"
            type="email"
            icon="mail"
            placeholder="you@school.edu"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full" iconRight="arrow-right">
            Send verification code
          </Button>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={handleVerifyCode} className="space-y-4" noValidate>
          <Input
            label="Verification code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            className="text-center text-lg font-bold tracking-[0.45em]"
            icon="key"
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Verify code
          </Button>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-700"
            >
              <Icon name="arrow-left" size={14} />
              Change email
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
        </form>
      ) : null}

      {step === 3 ? (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <Input
            label="New password"
            name="password"
            type={showPassword ? "text" : "password"}
            icon="lock"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
              </button>
            }
          />
          <Input
            label="Confirm new password"
            name="password_confirmation"
            type={showPassword ? "text" : "password"}
            icon="shield"
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Reset password
          </Button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            <Icon name="arrow-left" size={14} />
            Back to code
          </button>
        </form>
      ) : null}

      {step === 4 ? (
        <div className="animate-fade-up">
          <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
              <Icon name="check" size={26} strokeWidth={3} />
            </span>
            <h2 className="mt-4 text-lg font-bold text-emerald-900">All set!</h2>
            <p className="mt-1 max-w-sm text-sm text-emerald-800">
              Your password has been changed. Sign in with your new password to continue.
            </p>
            <Button
              size="lg"
              className="mt-6 w-full"
              iconRight="arrow-right"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to sign in
            </Button>
          </div>
        </div>
      ) : null}
    </AuthLayout>
  );
}
