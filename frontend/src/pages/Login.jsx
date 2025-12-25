import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "/auth/login",
        new URLSearchParams({
          username: form.email,
          password: form.password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/login-bg.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-96 animate-fadeIn"
      >
        {/* Logo */}
        <img
          src="/tasksure-logo.png"
          alt="TaskSure"
          className="h-20 mx-auto mb-4 hover:scale-105 transition-transform duration-300"
        />

        <h2 className="text-2xl font-bold text-center mb-1">
          Welcome Back
        </h2>
        <p className="text-center text-slate-500 mb-4 text-sm">
          Stay consistent. Build streaks.
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-2">
            {error}
          </p>
        )}

        <input
          name="email"
          placeholder="Email"
          className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onChange={handleChange}
          required
        />

        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 w-full rounded-lg font-semibold transition"
          type="submit"
        >
          Login
        </button>

        <p className="mt-4 text-center text-sm">
          No account?{" "}
          <a href="/register" className="text-indigo-600 font-semibold">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
