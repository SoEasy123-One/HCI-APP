import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import api, { getErrorMessage } from "@/api/axios";
import { Icon } from "@/components/Icon";
import { TaskItem } from "@/components/TaskItem";
import { Button, Card, EmptyState, Input, PageHeader } from "@/components/ui";
import { addDaysISO, cn, formatLongDate, todayISO } from "@/lib/utils";
import type { Task } from "@/types";

const filters = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    api
      .get<Task[]>("/tasks")
      .then((response) => {
        if (isActive) {
          setTasks(response.data);
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

  const today = todayISO();
  const tomorrow = addDaysISO(today, 1);

  const counts = useMemo<Record<FilterKey, number>>(
    () => ({
      all: tasks.length,
      today: tasks.filter((task) => task.task_date === today).length,
      upcoming: tasks.filter((task) => task.task_date > today).length,
      completed: tasks.filter((task) => task.is_done).length,
    }),
    [tasks, today],
  );

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        if (filter === "today") {
          return task.task_date === today;
        }
        if (filter === "upcoming") {
          return task.task_date > today;
        }
        if (filter === "completed") {
          return task.is_done;
        }
        return true;
      })
      .filter((task) => {
        if (!term) {
          return true;
        }
        return (
          task.title.toLowerCase().includes(term) ||
          (task.notes?.toLowerCase().includes(term) ?? false)
        );
      })
      .sort((a, b) => {
        const byDate = a.task_date.localeCompare(b.task_date);
        return byDate !== 0 ? byDate : a.start_time.localeCompare(b.start_time);
      });
  }, [tasks, filter, search, today]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Task[]>();

    for (const task of filteredTasks) {
      const list = groups.get(task.task_date) ?? [];
      list.push(task);
      groups.set(task.task_date, list);
    }

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTasks]);

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

  const deleteTask = async (task: Task) => {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/tasks/${task.id}`);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const dateLabel = (isoDate: string) => {
    if (isoDate === today) {
      return "Today";
    }
    if (isoDate === tomorrow) {
      return "Tomorrow";
    }
    return formatLongDate(isoDate);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Stay on track"
        title="Tasks"
        subtitle="Everything you need to do, grouped by day."
        actions={
          <Link
            to="/tasks/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700"
          >
            <Icon name="plus" size={16} />
            Add Task
          </Link>
        }
      />

      <Card className="p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                  filter === item.key
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-bold",
                    filter === item.key ? "bg-brand-50 text-brand-700" : "bg-slate-200 text-slate-500",
                  )}
                >
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="w-full lg:w-72">
            <Input
              type="search"
              name="task-search"
              icon="search"
              placeholder="Filter tasks…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10"
            />
          </div>
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
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-2xl bg-white shadow-card" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={filter === "completed" ? "check-circle" : "tasks"}
          title={
            filter === "completed"
              ? "No completed tasks yet"
              : search
                ? "No tasks match your filter"
                : "No tasks here"
          }
          description={
            filter === "completed"
              ? "Complete a task and it will show up here."
              : search
                ? "Try a different keyword or switch to another tab."
                : "Add your first task for this view and start checking things off."
          }
          action={
            <Button icon="plus" onClick={() => navigate("/tasks/new")}>
              Add a task
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([isoDate, groupTasks]) => (
            <section key={isoDate}>
              <div className="mb-2.5 flex items-center gap-2 px-1">
                <h2 className="text-sm font-bold text-slate-900">{dateLabel(isoDate)}</h2>
                <span className="rounded-full bg-slate-200/70 px-1.5 text-[10px] font-bold text-slate-500">
                  {groupTasks.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {groupTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
