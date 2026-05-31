"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";

export default function ProfileMenu() {
  const { token, user, loadingUser, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9080";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        await login(data.token);
        setUsername("");
        setPassword("");
      } else {
        setError(data.error || "Failed to log in.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Account created successfully! Please log in.");
        setActiveTab("login");
        setPassword("");
        setConfirmPassword("");
        setError(null);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center p-8 text-neutral-400 gap-2">
        <svg
          className="animate-spin h-8 w-8 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-sm font-medium">Validating session...</span>
      </div>
    );
  }

  // Render profile details if logged in
  if (user) {
    const formattedDate = new Date(user.createdAt).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    return (
      <div className="flex flex-col gap-5 px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)] select-text">
        <div className="bg-neutral-900/60 p-5 rounded-xl border border-neutral-800 flex flex-col items-center gap-4 text-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-2xl font-extrabold shadow-inner select-none">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-100">
              {user.username}
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              Brilliant Chess Member
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-neutral-950/20 p-4 rounded-xl border border-neutral-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-semibold">
              Database Connection
            </span>
            <span className="text-emerald-400 uppercase font-extrabold tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
              {user.dbType}
            </span>
          </div>
          <hr className="border-neutral-800/80" />
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 font-semibold">Join Date</span>
            <span className="text-neutral-300 font-bold">{formattedDate}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full text-sm font-bold py-3 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 hover:border-red-900/65 text-red-400 active:scale-95 transition-all cursor-pointer text-center select-none"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Tab Switcher */}
      <div className="flex bg-neutral-950/50 p-1 rounded-xl border border-neutral-900/50 select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setError(null);
            setSuccess(null);
          }}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
            activeTab === "login"
              ? "bg-neutral-800 text-neutral-100 shadow"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setError(null);
            setSuccess(null);
          }}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${
            activeTab === "register"
              ? "bg-neutral-800 text-neutral-100 shadow"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="text-center mt-1 select-none">
        <h2 className="text-lg font-black text-neutral-200">
          {activeTab === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-[11px] text-neutral-500 mt-1 max-w-[240px] mx-auto">
          {activeTab === "login"
            ? "Log in to sync your saved chess games and personal statistics."
            : "Create a free account to back up and track your chess performance."}
        </p>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="bg-red-950/20 border border-red-900/30 text-red-400 p-3 rounded-lg text-xs font-medium text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-3 rounded-lg text-xs font-medium text-center">
          {success}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={activeTab === "login" ? handleLogin : handleRegister}
        className="flex flex-col gap-3.5"
      >
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider pl-1 select-none">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="chessmaster"
            disabled={submitting}
            className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700/80 focus:border-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 placeholder:font-normal transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider pl-1 select-none">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700/80 focus:border-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 placeholder:font-normal transition-colors"
          />
        </div>

        {activeTab === "register" && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider pl-1 select-none">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/50 hover:border-neutral-700/80 focus:border-neutral-700 outline-none text-neutral-200 placeholder:text-neutral-700 placeholder:font-normal transition-colors"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-sm font-bold py-3 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all cursor-pointer text-center select-none"
        >
          {submitting
            ? activeTab === "login"
              ? "Logging in..."
              : "Signing up..."
            : activeTab === "login"
              ? "Log In"
              : "Register"}
        </button>
      </form>
    </div>
  );
}
