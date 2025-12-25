import React, { useEffect, useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofError, setProofError] = useState("");
  const [proofLoading, setProofLoading] = useState(false);

  const loadTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    loadTasks();
  };

  const submitProof = async (e) => {
    e.preventDefault();
    if (!proofText && !proofFile) {
      setProofError("Provide text or image proof.");
      return;
    }

    setProofLoading(true);
    const formData = new FormData();
    formData.append("proof_text", proofText);
    if (proofFile) formData.append("file", proofFile);

    const res = await api.post(
      `/tasks/${selectedTask.id}/proof`,
      formData
    );

    toast.success(`AI: ${res.data.proof_status}`);
    setSelectedTask(null);
    setProofText("");
    setProofFile(null);
    setProofLoading(false);
    loadTasks();
  };

 return (
  <div className="min-h-screen bg-slate-100 px-6 py-10">

    {/* ===== PAGE HEADER ===== */}
    <div className="max-w-6xl mx-auto mb-8">
      <h1 className="text-4xl font-extrabold text-slate-900">
        Task Management
      </h1>
      <p className="text-slate-600 mt-1">
        View, verify and manage all your tasks in one place
      </p>
    </div>

    {/* ===== TASK LIST ===== */}
    <div className="max-w-6xl mx-auto space-y-4">
      {tasks.length === 0 && (
        <p className="text-slate-500 text-center">
          No tasks available yet.
        </p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className="
            bg-slate-900 text-white
            rounded-2xl p-6
            flex flex-col sm:flex-row
            justify-between gap-4
            transition-all duration-200
            hover:shadow-2xl hover:-translate-y-1
          "
        >
          {/* LEFT */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">
                {task.title}
              </h2>

              <span className="text-xs px-3 py-1 rounded-full bg-slate-700 uppercase tracking-wide">
                {task.priority}
              </span>

              {task.proof_status && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    task.proof_status === "approved"
                      ? "bg-emerald-600"
                      : task.proof_status === "rejected"
                      ? "bg-red-600"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  {task.proof_status}
                </span>
              )}
            </div>

            {task.proof_feedback && (
              <p className="text-sm italic text-slate-300">
                AI Feedback: {task.proof_feedback}
              </p>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex gap-3 self-start sm:self-center">
            <button
              onClick={() => setSelectedTask(task)}
              className="
                bg-emerald-600 hover:bg-emerald-700
                px-5 py-2 rounded-xl
                font-medium
              "
            >
              Submit Proof
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              className="
                bg-red-600 hover:bg-red-700
                px-5 py-2 rounded-xl
                font-medium
              "
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* ===== PROOF MODAL ===== */}
    {selectedTask && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-1">
            Submit Proof
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Task: {selectedTask.title}
          </p>

          {proofError && (
            <p className="text-red-500 text-sm mb-2">
              {proofError}
            </p>
          )}

          <form onSubmit={submitProof} className="space-y-4">
            <textarea
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Explain how you completed this task"
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProofFile(e.target.files?.[0])
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-xl bg-slate-200"
              >
                Cancel
              </button>

              <button
                disabled={proofLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
              >
                {proofLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

}
