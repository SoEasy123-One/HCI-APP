import { Icon } from "@/components/Icon";
import { PriorityBadge } from "@/components/badges";
import { IconButton } from "@/components/ui";
import { cn, formatShortDate, formatTimeRange } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showDate?: boolean;
  className?: string;
}

export function TaskItem({ task, onToggle, onDelete, showDate = false, className }: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white px-3.5 py-3 transition-colors hover:border-slate-300",
        task.is_done && "bg-slate-50/60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-pressed={task.is_done}
        aria-label={task.is_done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          task.is_done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-brand-400 hover:text-brand-200",
        )}
      >
        <Icon name="check" size={12} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold text-slate-800",
              task.is_done && "text-slate-400 line-through",
            )}
          >
            {task.title}
          </p>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {showDate ? <span className="font-medium text-slate-600">{formatShortDate(task.task_date)}</span> : null}
          <span className="inline-flex items-center gap-1">
            <Icon name="clock" size={13} />
            {formatTimeRange(task.start_time, task.end_time)}
          </span>
        </div>

        {task.notes ? <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{task.notes}</p> : null}
      </div>

      {onDelete ? (
        <IconButton
          icon="trash"
          label={`Delete ${task.title}`}
          tone="danger"
          onClick={() => onDelete(task)}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        />
      ) : null}
    </div>
  );
}
