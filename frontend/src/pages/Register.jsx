import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <p className="text-red-500">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="username"
          placeholder="Username"
          className="w-full mb-2 p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          onChange={handleChange}
          required
        />

        <button
          className="bg-blue-500 text-white p-2 w-full rounded"
          type="submit"
        >
          Register
        </button>

        <p className="mt-2">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
