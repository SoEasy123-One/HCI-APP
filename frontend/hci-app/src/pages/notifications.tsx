import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "@/api/axios";
import { Icon, type IconName } from "@/components/Icon";
import { NotificationCategoryBadge } from "@/components/badges";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { cn, relativeTime } from "@/lib/utils";
import type { AppNotification, NotificationCategory, NotificationType } from "@/types";

const filters = [
  { key: "all", label: "All" },
  { key: "announcements", label: "Announcements", category: "announcement" },
  { key: "schedule", label: "Schedule", category: "schedule" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const typeIcon: Record<NotificationType, IconName> = {
  task_reminder: "clock",
  task_completed: "check-circle",
  announcement: "megaphone",
  system: "info",
  task_overdue: "alert",
};

const typeTone: Record<NotificationType, string> = {
  task_reminder: "bg-sky-50 text-sky-600",
  task_completed: "bg-emerald-50 text-emerald-600",
  announcement: "bg-brand-50 text-brand-600",
  system: "bg-slate-100 text-slate-500",
  task_overdue: "bg-rose-50 text-rose-600",
};

function matchesFilter(category: NotificationCategory, filter: FilterKey) {
  if (filter === "all") {
    return true;
  }
  if (filter === "announcements") {
    return category === "announcement";
  }
  return category === "schedule";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    api
      .get<AppNotification[]>("/notifications")
      .then((response) => {
        if (isActive) {
          setNotifications(response.data);
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

  const counts = useMemo(
    () => ({
      all: notifications.length,
      announcements: notifications.filter((item) => item.category === "announcement").length,
      schedule: notifications.filter((item) => item.category === "schedule").length,
      unread: notifications.filter((item) => !item.read_at).length,
    }),
    [notifications],
  );

  const visible = useMemo(
    () => notifications.filter((item) => matchesFilter(item.category, filter)),
    [notifications, filter],
  );

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const markRead = async (notification: AppNotification) => {
    if (notification.read_at) {
      return;
    }

    const optimisticReadAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read_at: optimisticReadAt } : item,
      ),
    );

    try {
      const { data } = await api.patch<AppNotification>(`/notifications/${notification.id}/read`);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? data : item)),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? notification : item)),
      );
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.read_at);
    if (unread.length === 0) {
      return;
    }

    setMarkingAll(true);
    setError("");

    try {
      const responses = await Promise.all(
        unread.map((item) => api.patch<AppNotification>(`/notifications/${item.id}/read`)),
      );
      const updated = new Map(responses.map((response) => [response.data.id, response.data]));
      setNotifications((current) => current.map((item) => updated.get(item.id) ?? item));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setLoading(true);
      setReloadKey((key) => key + 1);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        subtitle="Reminders, class updates, and announcements in one place."
        actions={
          <Button
            variant="secondary"
            icon="check"
            onClick={markAllRead}
            loading={markingAll}
            disabled={counts.unread === 0}
          >
            Mark all read
          </Button>
        }
      />

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

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
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

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-2xl bg-white shadow-card" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon="bell"
              title="You're all caught up"
              description={
                filter === "all"
                  ? "New notifications and reminders will appear here."
                  : "There are no notifications in this category right now."
              }
            />
          ) : (
            <div className="space-y-2.5">
              {visible.map((notification) => {
                const isUnread = !notification.read_at;

                return (
                  <article
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4 shadow-card transition-colors",
                      isUnread
                        ? "border-brand-200/80 bg-white"
                        : "border-slate-200/70 bg-slate-50/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                        typeTone[notification.type],
                      )}
                    >
                      <Icon name={typeIcon[notification.type]} size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isUnread ? (
                          <span className="size-2 rounded-full bg-brand-500" aria-label="Unread" />
                        ) : null}
                        <p
                          className={cn(
                            "text-sm font-bold",
                            isUnread ? "text-slate-900" : "text-slate-600",
                          )}
                        >
                          {notification.title}
                        </p>
                        <NotificationCategoryBadge category={notification.category} />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <Icon name="clock" size={12} />
                          {relativeTime(notification.created_at)}
                        </span>
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={() => markRead(notification)}
                            className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 transition-colors hover:bg-brand-100"
                          >
                            <Icon name="check" size={12} />
                            Mark read
                          </button>
                        ) : (
                          <Badge tone="slate">Read</Badge>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
              Inbox summary
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                {counts.unread}
              </span>
              <span className="pb-1 text-sm font-medium text-slate-500">
                unread {counts.unread === 1 ? "notification" : "notifications"}
              </span>
            </div>
            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">All notifications</span>
                <span className="font-bold text-slate-800">{counts.all}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Announcements</span>
                <span className="font-bold text-slate-800">{counts.announcements}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Schedule updates</span>
                <span className="font-bold text-slate-800">{counts.schedule}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              icon="check"
              onClick={markAllRead}
              loading={markingAll}
              disabled={counts.unread === 0}
              className="mt-4 w-full"
            >
              Mark all as read
            </Button>
          </Card>

          <Card className="flex items-start gap-3 p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Icon name="info" size={17} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">Stay on top of things</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Reminders appear here as tasks approach. Mark them read once you've handled
                them to keep your inbox tidy.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
