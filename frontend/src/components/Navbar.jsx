import { Link } from "react-router-dom";


export default function Navbar() {
  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      
      {/* LOGO */}
      <div className="flex items-center gap-2">
        <img
          src="/tasksure-logo.png"
          alt="TaskSure Logo"
          className="h-10 w-auto"
        />
       
      </div>

      {/* NAV LINKS */}
      <div className="flex items-center gap-6 text-slate-700 font-medium">
        <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
        <Link to="/tasks" className="hover:text-indigo-600">Tasks</Link>
        <Link to="/calendar" className="hover:text-indigo-600">Calendar</Link>
        <Link to="/leaderboard" className="hover:text-indigo-600">Leaderboard</Link>
        <Link to="/stats" className="hover:text-indigo-600">Stats</Link>
        <Link to="/profile" className="hover:text-indigo-600">Profile</Link>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
