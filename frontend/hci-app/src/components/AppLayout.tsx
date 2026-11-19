import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-14 sm:px-6 lg:px-8 lg:pt-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>CampusFlow — Student Schedule &amp; Task Manager</p>
          <p>Stay organized, one day at a time.</p>
        </div>
      </footer>
    </div>
  );
}
