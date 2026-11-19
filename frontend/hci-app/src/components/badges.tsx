import { Badge } from "@/components/ui";
import type { AnnouncementCategory, NotificationCategory, Priority } from "@/types";

const priorityTone = {
  high: "rose",
  medium: "amber",
  low: "emerald",
} as const;

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={priorityTone[priority]}>{priority[0].toUpperCase() + priority.slice(1)}</Badge>;
}

const notificationCategoryMeta: Record<NotificationCategory, { label: string; tone: "brand" | "sky" | "slate" }> = {
  announcement: { label: "Announcement", tone: "brand" },
  schedule: { label: "Schedule", tone: "sky" },
  other: { label: "Other", tone: "slate" },
};

export function NotificationCategoryBadge({ category }: { category: NotificationCategory }) {
  const meta = notificationCategoryMeta[category];

  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const announcementCategoryMeta: Record<
  AnnouncementCategory,
  { label: string; tone: "brand" | "sky" | "rose" }
> = {
  notification: { label: "Notification", tone: "brand" },
  schedule: { label: "Schedule", tone: "sky" },
  system: { label: "System", tone: "rose" },
};

export function AnnouncementCategoryBadge({ category }: { category: AnnouncementCategory }) {
  const meta = announcementCategoryMeta[category];

  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
