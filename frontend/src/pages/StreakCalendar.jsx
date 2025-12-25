import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function StreakCalendar() {
  const [completedDates, setCompletedDates] = useState([]);

  useEffect(() => {
    // TEMP: derive streaks from tasks
    const loadStreaks = async () => {
      const res = await api.get("/tasks");
      const completed = res.data
        .filter(t => t.completed_at)
        .map(t => t.completed_at.split("T")[0]);

      setCompletedDates(completed);
    };

    loadStreaks();
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isCompleted = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return completedDates.includes(dateStr);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        Streak Calendar
      </h1>
      <p className="text-slate-500 mb-6">
        Visualize your daily consistency
      </p>

      <div className="bg-white rounded-2xl shadow p-6 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">
          {today.toLocaleString("default", { month: "long" })} {year}
        </h2>

        {/* Week days */}
        <div className="grid grid-cols-7 text-sm text-slate-500 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => (
            <div
              key={idx}
              className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium
                ${!day ? "bg-transparent" :
                isCompleted(day)
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
              `}
            >
              {day || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
