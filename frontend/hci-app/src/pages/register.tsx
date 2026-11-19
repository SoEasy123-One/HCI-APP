import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { getErrorMessage } from "@/api/axios";
import AuthLayout from "@/components/AuthLayout";
import { Icon } from "@/components/Icon";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/auth";

export default function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    course_section: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your student workspace in less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
          >
            <Icon name="alert" size={17} className="mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <Input
          label="Full name"
          name="name"
          icon="user"
          placeholder="Rene Baterbonia"
          autoComplete="name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />

        <Input
          label="Email address"
          name="email"
          type="email"
          icon="mail"
          placeholder="you@school.edu"
          autoComplete="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          required
        />

        <Input
          label="Course & section"
          name="course_section"
          icon="book"
          placeholder="BSIT - 3B"
          hint="Optional. Helps personalize your workspace."
          value={form.course_section}
          onChange={(event) => update("course_section", event.target.value)}
        />

        <Input
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          icon="lock"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint="Use at least 8 characters."
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
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
          label="Confirm password"
          name="password_confirmation"
          type={showPassword ? "text" : "password"}
          icon="shield"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={form.password_confirmation}
          onChange={(event) => update("password_confirmation", event.target.value)}
          required
        />

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
