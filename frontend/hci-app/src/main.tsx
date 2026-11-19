import "@/styles/global.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import AddTaskPage from "@/pages/add-task";
import AnnouncementsPage from "@/pages/announcements";
import ForgotPasswordPage from "@/pages/forgot-password";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import NotificationsPage from "@/pages/notifications";
import RegisterPage from "@/pages/register";
import SchedulePage from "@/pages/schedule";
import TasksPage from "@/pages/tasks";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/tasks/new" element={<AddTaskPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
