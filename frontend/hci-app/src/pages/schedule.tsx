import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import api, { getErrorMessage } from "@/api/axios";
import { Icon } from "@/components/Icon";
import { PriorityBadge } from "@/components/badges";
import { Badge, Button, Card, EmptyState, IconButton, PageHeader } from "@/components/ui";
import {
  addDaysISO,
  cn,
  formatLongDate,
  formatTime,
  formatTimeRange,
  isToday,
  todayISO,
} from "@/lib/utils";
import type { ClassSchedule, Task } from "@/types";

type TimelineItem =
  | { kind: "class"; data: ClassSchedule }
  | { kind: "task"; data: Task };

export default function SchedulePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayISO());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    Promise.all([
      api.get<Task[]>("/tasks", { params: { date } }),
      api.get<ClassSchedule[]>("/class-schedules", { params: { date } }),
    ])
      .then(([tasksResponse, classesResponse]) => {
        if (isActive) {
          setTasks(tasksResponse.data);
          setClasses(classesResponse.data);
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
  }, [date, reloadKey]);

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [
      ...classes.map((item) => ({ kind: "class" as const, data: item })),
      ...tasks.map((item) => ({ kind: "task" as const, data: item })),
    ];

    return items.sort((a, b) => a.data.start_time.localeCompare(b.data.start_time));
  }, [classes, tasks]);

  const doneCount = tasks.filter((task) => task.is_done).length;

  const changeDate = (nextDate: string) => {
    if (nextDate === date) {
      return;
    }

    setLoading(true);
    setError("");
    setDate(nextDate);
  };

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const toggleTask = async (task: Task) => {
    const nextDone = !task.is_done;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, is_done: nextDone } : item)),
    );

    try {
      const { data } = await api.patch<Task>(`/tasks/${task.id}`, { is_done: nextDone });
      setTasks((current) => current.map((item) => (item.id === task.id ? data : item)));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setTasks((current) => current.map((item) => (item.id === task.id ? task : item)));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Plan ahead"
        title="My Schedule"
        subtitle="Your classes and tasks, laid out for the selected day."
        actions={
          <Link
            to={`/tasks/new?date=${date}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
          >
            <Icon name="plus" size={16} />
            Add Task
          </Link>
        }
      />

      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <IconButton
            icon="chevron-left"
            label="Previous day"
            onClick={() => changeDate(addDaysISO(date, -1))}
            className="border border-slate-200 bg-white"
          />
          <div className="min-w-0 px-1">
            <p className="truncate text-sm font-bold text-slate-900">{formatLongDate(date)}</p>
            <p className="text-[11px] text-slate-500">
              {isToday(date) ? "Today" : "Selected day"} · {classes.length}{" "}
              {classes.length === 1 ? "class" : "classes"} · {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
          <IconButton
            icon="chevron-right"
            label="Next day"
            onClick={() => changeDate(addDaysISO(date, 1))}
            className="border border-slate-200 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(event) => changeDate(event.target.value || todayISO())}
            aria-label="Choose a date"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
          />
          <Button
            variant="secondary"
            size="sm"
            icon="calendar"
            onClick={() => changeDate(todayISO())}
            disabled={isToday(date)}
          >
            Today
          </Button>
        </div>
      </Card>

      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <Icon name="alert" size={16} />
            {error}
          </span>
          <Button variant="secondary" size="sm" icon="refresh" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-white shadow-card" />
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Nothing scheduled"
          description="There are no classes or tasks for this day. Add a task to plan ahead."
          action={
            <Button icon="plus" onClick={() => navigate(`/tasks/new?date=${date}`)}>
              Add a task
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {timeline.map((item) =>
            item.kind === "class" ? (
              <div
                key={`class-${item.data.id}`}
                className="group flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-colors hover:border-slate-300 sm:gap-5"
              >
                <div className="w-16 shrink-0 text-right sm:w-20">
                  <p className="text-sm font-extrabold text-slate-800">
                    {formatTime(item.data.start_time)}
                  </p>
                  <p className="text-[11px] text-slate-400">{formatTime(item.data.end_time)}</p>
                </div>
                <div className="relative flex-1 border-l border-slate-200 pl-4 sm:pl-5">
                  <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{item.data.subject}</p>
                    <Badge tone="brand">
                      <Icon name="book" size={11} />
                      Class
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="clock" size={13} />
                      {formatTimeRange(item.data.start_time, item.data.end_time)}
                    </span>
                    {item.data.room ? (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="pin" size={13} />
                        {item.data.room}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={`task-${item.data.id}`}
                className="group flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-colors hover:border-slate-300 sm:gap-5"
              >
                <div className="w-16 shrink-0 text-right sm:w-20">
                  <p
                    className={cn(
                      "text-sm font-extrabold text-slate-800",
                      item.data.is_done && "text-slate-400 line-through",
                    )}
                  >
                    {formatTime(item.data.start_time)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.data.end_time ? formatTime(item.data.end_time) : "—"}
                  </p>
                </div>
                <div className="relative flex-1 border-l border-slate-200 pl-4 sm:pl-5">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4",
                      item.data.is_done
                        ? "bg-emerald-500 ring-emerald-50"
                        : "bg-amber-400 ring-amber-50",
                    )}
                  />
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(item.data)}
                      aria-pressed={item.data.is_done}
                      aria-label={
                        item.data.is_done
                          ? `Mark ${item.data.title} as not done`
                          : `Mark ${item.data.title} as done`
                      }
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                        item.data.is_done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-transparent hover:border-brand-400",
                      )}
                    >
                      <Icon name="check" size={12} strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-bold text-slate-900",
                            item.data.is_done && "text-slate-400 line-through",
                          )}
                        >
                          {item.data.title}
                        </p>
                        <PriorityBadge priority={item.data.priority} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" size={13} />
                          {formatTimeRange(item.data.start_time, item.data.end_time)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="tasks" size={13} />
                          Task
                        </span>
                      </div>
                      {item.data.notes ? (
                        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{item.data.notes}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {!loading && tasks.length > 0 ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <Icon name="check-circle" size={14} className="text-emerald-500" />
          {doneCount} of {tasks.length} tasks completed for this day
        </p>
      ) : null}
    </div>
  );
}
