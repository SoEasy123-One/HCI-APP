import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "@/api/axios";
import { Icon, type IconName } from "@/components/Icon";
import { AnnouncementCategoryBadge } from "@/components/badges";
import { Badge, Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { cn, formatShortDate, relativeTime } from "@/lib/utils";
import type { Announcement, AnnouncementCategory } from "@/types";

const filters = [
  { key: "all", label: "All" },
  { key: "notification", label: "Notifications" },
  { key: "schedule", label: "Schedule" },
  { key: "system", label: "System" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const categoryIcon: Record<AnnouncementCategory, IconName> = {
  notification: "bell",
  schedule: "calendar",
  system: "shield",
};

const categoryTone: Record<AnnouncementCategory, string> = {
  notification: "bg-brand-50 text-brand-600",
  schedule: "bg-sky-50 text-sky-600",
  system: "bg-rose-50 text-rose-600",
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    api
      .get<Announcement[]>("/announcements")
      .then((response) => {
        if (isActive) {
          setAnnouncements(response.data);
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

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((key) => key + 1);
  };

  const counts = useMemo(
    () => ({
      all: announcements.length,
      notification: announcements.filter((item) => item.category === "notification").length,
      schedule: announcements.filter((item) => item.category === "schedule").length,
      system: announcements.filter((item) => item.category === "system").length,
    }),
    [announcements],
  );

  const visible = useMemo(
    () =>
      announcements.filter((item) => (filter === "all" ? true : item.category === filter)),
    [announcements, filter],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Campus bulletin"
        title="Announcements"
        subtitle="Official updates from your school and instructors."
        actions={
          <Button
            variant="secondary"
            icon="refresh"
            onClick={retry}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      <Card className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
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

        <Badge tone="slate" className="self-start sm:self-auto">
          <Icon name="megaphone" size={12} />
          {visible.length} showing
        </Badge>
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
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl bg-white shadow-card" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="megaphone"
          title="No announcements yet"
          description={
            filter === "all"
              ? "School and instructor announcements will show up here."
              : "There are no announcements in this category right now."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((announcement) => (
            <Card key={announcement.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    categoryTone[announcement.category],
                  )}
                >
                  <Icon name={categoryIcon[announcement.category]} size={18} />
                </span>
                <AnnouncementCategoryBadge category={announcement.category} />
              </div>

              <h2 className="mt-3 text-base font-bold text-slate-900">{announcement.title}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed whitespace-pre-line text-slate-500">
                {announcement.body}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Icon name="clock" size={12} />
                  {relativeTime(announcement.posted_at)}
                </span>
                <span>{formatShortDate(announcement.posted_at.slice(0, 10))}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
