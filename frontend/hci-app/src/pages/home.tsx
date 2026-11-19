import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import api, { getErrorMessage } from "@/api/axios";
import { Icon, type IconName } from "@/components/Icon";
import { TaskItem } from "@/components/TaskItem";
import { Button, Card, EmptyState } from "@/components/ui";
import { useAuth } from "@/context/auth";
import {
  cn,
  formatDayNumber,
  formatLongDate,
  formatMonthShort,
  formatShortDate,
  formatTime,
  formatTimeRange,
  isToday,
  relativeTime,
  todayISO,
} from "@/lib/utils";
import type { Dashboard, SearchResults, Task } from "@/types";

const toneStyles: Record<string, string> = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
};

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    let isActive = true;

    api
      .get<Dashboard>("/dashboard")
      .then((response) => {
        if (isActive) {
          setDashboard(response.data);
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const currentUser = dashboard?.user ?? user;
  const firstName = (currentUser?.name ?? "Student").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const summary: Array<{
    label: string;
    value: number;
    icon: IconName;
    to: string;
    tone: keyof typeof toneStyles;
    helper: string;
  }> = [
    {
      label: "Pending tasks",
      value: dashboard?.tasks_count ?? 0,
      icon: "tasks",
      to: "/tasks",
      tone: "brand",
      helper: "Across all dates",
    },
    {
      label: "Today's classes",
      value: dashboard?.today_schedule_count ?? 0,
      icon: "calendar",
      to: "/schedule",
      tone: "sky",
      helper: "On your timetable",
    },
    {
      label: "Unread alerts",
      value: dashboard?.notifications_count ?? 0,
      icon: "bell",
      to: "/notifications",
      tone: "amber",
      helper: "Needs attention",
    },
    {
      label: "Announcements",
      value: dashboard?.announcements_count ?? 0,
      icon: "megaphone",
      to: "/announcements",
      tone: "violet",
      helper: "Last 7 days",
    },
  ];

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const toggleTask = async (task: Task) => {
    const nextDone = !task.is_done;

    setDashboard((current) =>
      current
        ? {
            ...current,
            tasks_count: Math.max(0, current.tasks_count + (nextDone ? -1 : 1)),
            today_tasks: current.today_tasks.map((item) =>
              item.id === task.id ? { ...item, is_done: nextDone } : item,
            ),
          }
        : current,
    );

    try {
      const { data } = await api.patch<Task>(`/tasks/${task.id}`, { is_done: nextDone });
      setDashboard((current) =>
        current
          ? {
              ...current,
              today_tasks: current.today_tasks.map((item) => (item.id === task.id ? data : item)),
            }
          : current,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setDashboard((current) =>
        current
          ? {
              ...current,
              tasks_count: Math.max(0, current.tasks_count + (nextDone ? 1 : -1)),
              today_tasks: current.today_tasks.map((item) =>
                item.id === task.id ? task : item,
              ),
            }
          : current,
      );
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();

    if (!term) {
      setResults(null);
      return;
    }

    setSearching(true);
    setSearchError("");
    setResults(null);

    try {
      const { data } = await api.get<SearchResults>("/search", { params: { q: term } });
      setResults(data);
    } catch (requestError) {
      setSearchError(getErrorMessage(requestError));
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setSearchError("");
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error && !dashboard) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Icon name="alert" size={22} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">We couldn't load your dashboard</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">{error}</p>
          <Button className="mt-5" icon="refresh" onClick={retry}>
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  const searchResultCount = results
    ? results.tasks.length + results.class_schedules.length + results.announcements.length
    : 0;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 px-5 py-7 text-white shadow-float sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:26px_26px]" />

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-brand-200 uppercase">
                {formatLongDate(todayISO())}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1.5 max-w-xl text-sm text-brand-100">
                {dashboard?.tasks_count
                  ? `You have ${dashboard.tasks_count} pending ${dashboard.tasks_count === 1 ? "task" : "tasks"} and ${dashboard.today_schedule_count} ${dashboard.today_schedule_count === 1 ? "class" : "classes"} today. Let's make it a productive one.`
                  : "Your task list is clear. Enjoy the breathing room — or get a head start on what's next."}
              </p>
              {currentUser?.course_section ? (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20">
                  <Icon name="graduation-cap" size={13} />
                  {currentUser.course_section}
                </span>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to="/tasks/new"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-brand-700 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <Icon name="plus" size={16} />
                Add task
              </Link>
              <Link
                to="/schedule"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
              >
                <Icon name="calendar" size={16} />
                Schedule
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks, classes, or announcements…"
                aria-label="Search tasks, classes, or announcements"
                className="h-11 w-full rounded-xl border-0 bg-white/95 pr-10 pl-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <Icon name="close" size={16} />
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={searching}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-5 text-sm font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 disabled:opacity-60"
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </form>

          {searchError ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-200">
              <Icon name="alert" size={14} />
              {searchError}
            </p>
          ) : null}
        </div>
      </section>

      {results || searching ? (
        <Card className="animate-fade-up p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Search results</h2>
              <p className="text-xs text-slate-500">
                {searching
                  ? "Looking through your workspace…"
                  : `${searchResultCount} ${searchResultCount === 1 ? "result" : "results"} for “${query}”`}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="close" size={14} />
              Close
            </button>
          </div>

          {searching ? (
            <div className="mt-4 space-y-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : results && searchResultCount > 0 ? (
            <div className="mt-4 space-y-5">
              {results.tasks.length > 0 ? (
                <SearchGroup title="Tasks" icon="tasks" count={results.tasks.length}>
                  {results.tasks.map((task) => (
                    <Link
                      key={task.id}
                      to="/tasks"
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 px-3.5 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatShortDate(task.task_date)} ·{" "}
                          {formatTimeRange(task.start_time, task.end_time)}
                        </p>
                      </div>
                      <Icon name="chevron-right" size={16} className="text-slate-400" />
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}

              {results.class_schedules.length > 0 ? (
                <SearchGroup title="Classes" icon="calendar" count={results.class_schedules.length}>
                  {results.class_schedules.map((schedule) => (
                    <Link
                      key={schedule.id}
                      to="/schedule"
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 px-3.5 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {schedule.subject}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatShortDate(schedule.class_date)} ·{" "}
                          {formatTimeRange(schedule.start_time, schedule.end_time)}
                          {schedule.room ? ` · ${schedule.room}` : ""}
                        </p>
                      </div>
                      <Icon name="chevron-right" size={16} className="text-slate-400" />
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}

              {results.announcements.length > 0 ? (
                <SearchGroup title="Announcements" icon="megaphone" count={results.announcements.length}>
                  {results.announcements.map((announcement) => (
                    <Link
                      key={announcement.id}
                      to="/announcements"
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 px-3.5 py-2.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {announcement.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {relativeTime(announcement.posted_at)}
                        </p>
                      </div>
                      <Icon name="chevron-right" size={16} className="text-slate-400" />
                    </Link>
                  ))}
                </SearchGroup>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon="search"
                title="No matches found"
                description="Try a different keyword, or search for a subject, task, or room."
              />
            </div>
          )}
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Summary">
        {summary.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:p-5"
          >
            <div className="flex items-start justify-between">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl ring-1",
                  toneStyles[item.tone],
                )}
              >
                <Icon name={item.icon} size={19} />
              </span>
              <Icon
                name="arrow-right"
                size={16}
                className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
              />
            </div>
            <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-700">{item.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{item.helper}</p>
          </Link>
        ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Icon name="sun" size={16} className="text-amber-500" />
                Today's tasks
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Everything on your plate for today.</p>
            </div>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              View all
              <Icon name="chevron-right" size={14} />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {dashboard && dashboard.today_tasks.length > 0 ? (
              dashboard.today_tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))
            ) : (
              <EmptyState
                icon="check-circle"
                title="Nothing due today"
                description="Your day is clear. Add a task if something comes up."
                action={
                  <Button size="sm" icon="plus" onClick={() => navigate("/tasks/new")}>
                    Add a task
                  </Button>
                }
                className="py-8"
              />
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Icon name="calendar" size={16} className="text-brand-600" />
                Upcoming schedule
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Your next classes at a glance.</p>
            </div>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
            >
              Open
              <Icon name="chevron-right" size={14} />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {dashboard && dashboard.upcoming_schedule.length > 0 ? (
              dashboard.upcoming_schedule.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200/70 px-3 py-2.5"
                >
                  <div
                    className={cn(
                      "flex w-11 shrink-0 flex-col items-center rounded-lg py-1.5",
                      isToday(schedule.class_date)
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {formatMonthShort(schedule.class_date)}
                    </span>
                    <span className="text-base leading-none font-extrabold">
                      {formatDayNumber(schedule.class_date)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{schedule.subject}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="clock" size={12} />
                        {formatTime(schedule.start_time)}
                      </span>
                      {schedule.room ? (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="pin" size={12} />
                          {schedule.room}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {isToday(schedule.class_date) ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                      Today
                    </span>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState
                icon="calendar"
                title="No classes scheduled"
                description="Your upcoming timetable will appear here."
                className="py-8"
              />
            )}
          </div>
        </Card>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
          <Icon name="alert" size={15} />
          {error}
        </div>
      ) : null}
    </div>
  );
}

function SearchGroup({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: IconName;
  count: number;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase">
        <Icon name={icon} size={13} />
        {title}
        <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">{count}</span>
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 animate-pulse rounded-3xl bg-slate-200/70" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-32 animate-pulse rounded-2xl bg-white shadow-card" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-card lg:col-span-3" />
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-card lg:col-span-2" />
      </div>
    </div>
  );
}
