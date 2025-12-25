import React, { useEffect, useState, useRef } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

function Dashboard() {
  // ------------------ State ------------------
  const [, setTasks] = useState([]); // tasks not rendered here (Tasks page handles it)
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  // Pomodoro
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Quotes
  const quotes = [
    "Proof turns effort into achievement.",
    "Small tasks. Big discipline.",
    "Consistency beats motivation.",
    "One task at a time. One streak at a time.",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // ------------------ API ------------------
  const loadTasks = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/stats/me"),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch {
      setError("Failed to load data");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        due_date: form.due_date
          ? new Date(form.due_date).toISOString()
          : null,
      };

      await api.post("/tasks", payload);
      setForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
      });
      await loadTasks();
      toast.success("Task created 🎯");
    } catch {
      setError("Failed to create task");
    }
  };

  // ------------------ Pomodoro ------------------
  const startTimer = () => {
    if (timerRef.current) return;
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
          toast("Session complete ☕");
          return 5 * 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // ------------------ Effects ------------------
  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(q);
  }, [quotes.length]);

  // ------------------ UI ------------------
 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200 px-6 py-12 space-y-14">

  {/* ===== TOP BRAND BAR ===== */}
<div className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 shadow-lg">
  <div className="max-w-7xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

    {/* Logo */}
    <div className="flex items-center gap-4">
      <img
        src="/tasksure-logo.png"
        alt="TaskSure"
        className="h-14 w-auto hover:scale-105 transition-transform duration-300"
      />
    </div>

    {/* Welcome Message */}
    <div className="text-center sm:text-left">
      <p className="text-white text-sm opacity-90">
        Welcome back 👋
      </p>
      <p className="text-white text-lg font-semibold">
        Let’s make today productive
      </p>
    </div>

    {/* Quote */}
    <p className="italic text-white/90 text-sm sm:text-base text-center transition-opacity duration-500 max-w-md">
      “{quotes[quoteIndex]}”
    </p>

  </div>
</div>



    {/* ===== STATS ===== */}
    {stats && (
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Stat title="Total Points" value={stats.total_points} color="indigo" />
        <Stat title="Current Streak" value={`${stats.current_streak} days`} color="emerald" />
        <Stat title="Longest Streak" value={`${stats.longest_streak} days`} color="orange" />
      </div>
    )}

    {/* ===== CREATE TASK ===== */}
    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-10 hover:shadow-2xl transition-shadow">
      <h2 className="text-3xl font-bold text-center mb-6">
        Create a New Task
      </h2>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      <form onSubmit={createTask} className="space-y-5">
        <input
          className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500 transition"
          placeholder="Task description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="p-4 rounded-xl border"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <input
            type="date"
            className="p-4 rounded-xl border"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </div>

        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold hover:scale-[1.02] transition-transform">
          Add Task
        </button>
      </form>
    </div>

    {/* ===== POMODORO (DARK SECTION) ===== */}
    <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl shadow-2xl p-12 text-center text-white">
      <h2 className="text-2xl font-semibold mb-4">
        Pomodoro Focus
      </h2>

      <p className="text-6xl font-mono text-emerald-400 mb-8 animate-pulse">
        {formatTime(timeLeft)}
      </p>

      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl transition"
          >
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl transition"
          >
            Pause
          </button>
        )}

        <button
          onClick={resetTimer}
          className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded-xl transition"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
);

}

function Stat({ title, value, color }) {
  const gradients = {
    indigo: "from-indigo-500 to-indigo-700",
    emerald: "from-emerald-500 to-emerald-700",
    orange: "from-orange-500 to-orange-700",
  };

  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-br ${gradients[color]} hover:-translate-y-1 transition-all duration-300`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}


export default Dashboard;
