import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Trophy,
  BarChart3,
  LogOut,
} from "lucide-react";

export default function AppLayout() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const baseLink =
    "flex items-center gap-3 px-4 py-2 rounded-xl text-slate-700 font-medium transition-all";

  const activeLink =
    "bg-indigo-600 text-white shadow";

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r px-5 py-6 flex flex-col">

        {/* LOGO / BRAND */}
       <div className="flex flex-col items-center justify-center gap-3 mb-10">
  <img
    src="/tasksure-logo.png"
    alt="TaskSure Logo"
    className="h-28 w-auto object-contain"
  />

  
</div>

        {/* NAV LINKS */}
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : "hover:bg-indigo-100"}`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : "hover:bg-indigo-100"}`
            }
          >
            <ListChecks size={18} />
            Tasks
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : "hover:bg-indigo-100"}`
            }
          >
            <CalendarDays size={18} />
            Calendar
          </NavLink>

          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : "hover:bg-indigo-100"}`
            }
          >
            <Trophy size={18} />
            Leaderboard
          </NavLink>

          <NavLink
            to="/stats"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : "hover:bg-indigo-100"}`
            }
          >
            <BarChart3 size={18} />
            Stats
          </NavLink>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="mt-6 flex items-center gap-3 px-4 py-2 rounded-xl
                     text-red-600 font-medium hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
