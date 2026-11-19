import type { ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "@/components/Icon";

const features = [
  { icon: "calendar" as const, text: "See your class timetable at a glance" },
  { icon: "tasks" as const, text: "Keep every task and deadline in one place" },
  { icon: "bell" as const, text: "Never miss a reminder or announcement" },
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh bg-slate-50">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] bg-[size:26px_26px]" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Icon name="graduation-cap" size={21} />
            </span>
            <span className="text-base font-extrabold tracking-tight">
              Campus<span className="text-brand-300">Flow</span>
            </span>
          </Link>

          <div className="mt-20 max-w-md">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-brand-200 uppercase ring-1 ring-white/10">
              <Icon name="sparkles" size={13} />
              Student planner
            </p>
            <h2 className="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance">
              Plan your day. <span className="text-brand-300">Own your week.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              CampusFlow brings your class schedule, tasks, reminders, and campus announcements
              together in one calm, focused workspace.
            </p>
          </div>
        </div>

        <div className="relative space-y-4">
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3 text-sm text-slate-200">
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-brand-200 ring-1 ring-white/10">
                  <Icon name={feature.icon} size={16} />
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
          <p className="border-t border-white/10 pt-4 text-xs text-slate-400">
            Built for students who want to stay ahead — not overwhelmed.
          </p>
        </div>
      </aside>

      <main className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:w-[54%]">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm shadow-brand-600/30">
              <Icon name="graduation-cap" size={20} />
            </span>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-brand-600">Flow</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
