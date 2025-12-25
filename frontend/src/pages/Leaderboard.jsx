import React, { useEffect, useState } from "react";
import api from "../api/api";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/leaderboard")
      .then((res) => {
        setUsers(res.data); // ✅ DIRECT ARRAY
      })
      .catch((err) => {
        console.error("Leaderboard error:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        🏆 Leaderboard
      </h1>

      {users.length === 0 ? (
        <p className="text-slate-500">No leaderboard data yet.</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Rank</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Points</th>
              <th className="p-3 text-left">Streak</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr
                key={i}
                className="border-b hover:bg-indigo-50 transition"
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3">{u.total_points}</td>
                <td className="p-3">{u.current_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
