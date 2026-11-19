import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Icon, type IconName } from "@/components/Icon";
import { Avatar, Button } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

const navItems: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/schedule", label: "My Schedule", icon: "calendar" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
  { to: "/notifications", label: "Notifications", icon: "bell" },
  { to: "/announcements", label: "Announcements", icon: "megaphone" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenus = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMenus} className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-sm shadow-brand-600/30">
            <Icon name="graduation-cap" size={19} />
          </span>
          <span className="hidden text-[15px] font-extrabold tracking-tight text-slate-900 sm:block">
            Campus<span className="text-brand-600">Flow</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={closeMenus}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/tasks/new"
            onClick={closeMenus}
            className="hidden h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-bold text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 sm:inline-flex"
          >
            <Icon name="plus" size={15} />
            Add task
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((open) => !open);
                setMobileOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl p-1 pr-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              <Avatar name={user?.name ?? "Student"} />
              <span className="hidden text-left sm:block">
                <span className="block max-w-32 truncate text-xs font-bold text-slate-800">
                  {user?.name ?? "Student"}
                </span>
                <span className="block max-w-32 truncate text-[11px] text-slate-500">
                  {user?.course_section ?? "Student"}
                </span>
              </span>
              <Icon name="chevron-down" size={15} className="hidden text-slate-400 sm:block" />
            </button>

            {profileOpen ? (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setProfileOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-2 w-64 animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-float"
                >
                  <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
                    <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    {user?.course_section ? (
                      <p className="mt-1 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        {user.course_section}
                      </p>
                    ) : null}
                  </div>
                  <div className="p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon name="logout" size={17} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileOpen((open) => !open);
              setProfileOpen(false);
            }}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 lg:hidden"
          >
            <Icon name={mobileOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="animate-fade-in border-t border-slate-200 bg-white px-4 pt-3 pb-4 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeMenus}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
            <Button
              variant="secondary"
              size="sm"
              icon="logout"
              className="flex-1"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
