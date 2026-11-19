import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import api, { getErrorMessage } from "@/api/axios";
import { Icon } from "@/components/Icon";
import { PriorityBadge } from "@/components/badges";
import { Button, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { formatLongDate, formatTimeRange, todayISO } from "@/lib/utils";
import type { Priority, TaskPayload } from "@/types";

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "low", label: "Low — flexible" },
  { value: "medium", label: "Medium — normal" },
  { value: "high", label: "High — important" },
];

export default function AddTaskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    title: "",
    task_date: searchParams.get("date") ?? todayISO(),
    start_time: "09:00",
    end_time: "10:00",
    priority: "medium" as Priority,
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please give your task a name.");
      return;
    }

    if (!form.task_date || !form.start_time || !form.end_time) {
      setError("Please complete the date and time fields.");
      return;
    }

    if (form.end_time <= form.start_time) {
      setError("The end time must be after the start time.");
      return;
    }

    const payload: TaskPayload = {
      title: form.title.trim(),
      task_date: form.task_date,
      start_time: form.start_time,
      end_time: form.end_time,
      priority: form.priority,
      notes: form.notes.trim(),
    };

    setLoading(true);

    try {
      await api.post("/tasks", payload);
      navigate("/tasks");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="New task"
        title="Add New Task"
        subtitle="Capture what needs to get done and when."
        actions={
          <Link
            to="/tasks"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Icon name="arrow-left" size={16} />
            Back to tasks
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              label="Task name"
              name="title"
              icon="clipboard"
              placeholder="e.g. Review HCI wireframes"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              autoFocus
              required
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Date"
                name="task_date"
                type="date"
                icon="calendar"
                value={form.task_date}
                onChange={(event) => update("task_date", event.target.value)}
                required
              />
              <Input
                label="Start time"
                name="start_time"
                type="time"
                icon="clock"
                value={form.start_time}
                onChange={(event) => update("start_time", event.target.value)}
                required
              />
              <Input
                label="End time"
                name="end_time"
                type="time"
                icon="clock"
                value={form.end_time}
                onChange={(event) => update("end_time", event.target.value)}
                required
              />
            </div>

            <Select
              label="Priority"
              name="priority"
              value={form.priority}
              onChange={(event) => update("priority", event.target.value)}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Textarea
              label="Notes"
              name="notes"
              placeholder="Add details, reminders, or links… (optional)"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              hint="Optional — but helpful for future you."
            />

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => navigate("/tasks")}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} icon="check">
                Save Task
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-brand-600 to-violet-700 px-5 py-4 text-white">
              <p className="text-[11px] font-bold tracking-[0.14em] text-brand-200 uppercase">
                Live preview
              </p>
              <p className="mt-1 text-sm font-bold">
                {form.title.trim() || "Untitled task"}
              </p>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Priority</span>
                <PriorityBadge priority={form.priority} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Date</span>
                <span className="text-xs font-semibold text-slate-700">
                  {form.task_date ? formatLongDate(form.task_date) : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">Time</span>
                <span className="text-xs font-semibold text-slate-700">
                  {form.start_time && form.end_time
                    ? formatTimeRange(form.start_time, form.end_time)
                    : "Not set"}
                </span>
              </div>
              {form.notes.trim() ? (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs text-slate-500">Notes</p>
                  <p className="mt-1 line-clamp-3 text-xs text-slate-700">{form.notes}</p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Icon name="sparkles" size={16} className="text-brand-600" />
              Quick tips
            </h2>
            <ul className="mt-3 space-y-2.5 text-xs text-slate-500">
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-0.5 text-emerald-500" />
                Use a short, action-first title like “Submit database activity”.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-0.5 text-emerald-500" />
                Give yourself a realistic time block so the day stays balanced.
              </li>
              <li className="flex gap-2">
                <Icon name="check" size={14} className="mt-0.5 text-emerald-500" />
                Mark high priority only for work that truly can't wait.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
