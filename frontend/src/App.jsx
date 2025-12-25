import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import StreakCalendar from "./pages/StreakCalendar";
import Leaderboard from "./pages/Leaderboard";
import Stats from "./pages/Stats";

import AppLayout from "./layouts/AppLayout";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* ---------- PROTECTED ROUTES (WITH NAVBAR) ---------- */}
        <Route
          path="/"
          element={token ? <AppLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<StreakCalendar />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="stats" element={<Stats />} />
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route
          path="*"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </>
  );
}

export default App;
