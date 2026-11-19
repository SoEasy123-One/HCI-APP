export type Priority = "low" | "medium" | "high";

export type NotificationType =
  | "task_reminder"
  | "task_completed"
  | "announcement"
  | "system"
  | "task_overdue";

export type NotificationCategory = "announcement" | "schedule" | "other";

export type AnnouncementCategory = "notification" | "schedule" | "system";

export interface User {
  id: number;
  name: string;
  email: string;
  course_section: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  task_date: string;
  start_time: string;
  end_time: string | null;
  priority: Priority;
  notes: string | null;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassSchedule {
  id: number;
  user_id: number;
  subject: string;
  class_date: string;
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: number;
  user_id: number;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  category: AnnouncementCategory;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  user: User;
  tasks_count: number;
  today_schedule_count: number;
  notifications_count: number;
  announcements_count: number;
  today_tasks: Task[];
  upcoming_schedule: ClassSchedule[];
}

export interface SearchResults {
  tasks: Task[];
  class_schedules: ClassSchedule[];
  announcements: Announcement[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  course_section: string;
  password: string;
  password_confirmation: string;
}

export interface TaskPayload {
  title: string;
  task_date: string;
  start_time: string;
  end_time: string;
  priority: Priority;
  notes: string;
}
