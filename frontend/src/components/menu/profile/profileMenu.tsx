"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";
import { apiUrl } from "@/lib/api";

export default function ProfileMenu() {
  const { user, loadingUser, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await login();
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
      const res = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        credentials: "include",
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
      <div className="flex flex-col flex-grow items-center justify-center p-8 text-foregroundGrey/60 gap-2">
        <svg
          className="animate-spin h-8 w-8 text-foregroundGrey/40"
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
        <span className="text-xs font-semibold">Validating session...</span>
      </div>
    );
  }

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
      <div className="flex flex-col gap-5 px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)] select-text animate-fade-in w-full">
        <div className="bg-backgroundBoxBox/45 border border-white/5 backdrop-blur-md p-5 rounded-borderExtraRoundness flex flex-col items-center gap-4 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-highlightBest to-highlightBrilliant flex items-center justify-center text-foreground font-black text-2xl shadow-md select-none border border-white/10">
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-black text-foregroundHighlighted">
              {user.username}
            </h2>
            <span className="text-[10px] text-foregroundGrey/70 uppercase tracking-wider font-extrabold mt-1 block">
              Brilliant Chess Member
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-black/15 p-4 rounded-borderExtraRoundness border border-white/5 shadow-inner">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-foregroundGrey/80">
              Database Connection
            </span>
            <span className="text-highlightBest uppercase font-extrabold tracking-wider bg-highlightBest/10 px-2 py-0.5 rounded border border-highlightBest/20 shadow-sm">
              {user.dbType}
            </span>
          </div>
          <hr className="border-white/5" />
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-foregroundGrey/80">Join Date</span>
            <span className="text-foregroundHighlighted font-bold">{formattedDate}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="w-full text-sm font-extrabold py-3 rounded-borderExtraRoundness bg-red-950/20 border border-red-900/35 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.98] shadow-sm"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-4 overflow-y-auto max-h-[calc(100vh-140px)] w-full animate-fade-in">
      <div className="flex bg-backgroundBoxDarker/30 p-0.5 rounded-borderRoundness border border-white/5 select-none shrink-0">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setError(null);
            setSuccess(null);
          }}
          className={`flex-grow py-1.5 text-xs font-extrabold rounded-borderRoundness transition-all duration-200 text-center cursor-pointer ${
            activeTab === "login"
              ? "bg-backgroundBoxBoxHighlighted text-foreground shadow-sm"
              : "text-foregroundGrey hover:text-foregroundHighlighted hover:bg-white/5"
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
          className={`flex-grow py-1.5 text-xs font-extrabold rounded-borderRoundness transition-all duration-200 text-center cursor-pointer ${
            activeTab === "register"
              ? "bg-backgroundBoxBoxHighlighted text-foreground shadow-sm"
              : "text-foregroundGrey hover:text-foregroundHighlighted hover:bg-white/5"
          }`}
        >
          Sign Up
        </button>
      </div>

      <div className="text-center mt-1 select-none flex flex-col gap-1">
        <h2 className="text-base font-black text-foregroundHighlighted">
          {activeTab === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-[10px] text-foregroundGrey/70 max-w-[240px] mx-auto leading-relaxed font-semibold">
          {activeTab === "login"
            ? "Log in to sync your saved chess games and personal statistics."
            : "Create a free account to back up and track your chess performance."}
        </p>
      </div>

      {error && (
        <div className="bg-highlightBlunder/15 border border-highlightBlunder/25 text-highlightBlunder p-3 rounded-borderRoundness text-xs font-semibold text-center leading-relaxed animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-highlightBest/15 border border-highlightBest/25 text-highlightBest p-3 rounded-borderRoundness text-xs font-semibold text-center leading-relaxed animate-fade-in">
          {success}
        </div>
      )}

      <form
        onSubmit={activeTab === "login" ? handleLogin : handleRegister}
        className="flex flex-col gap-4 select-text"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider pl-1.5 select-none">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="chessmaster"
            disabled={submitting}
            className="w-full px-3.5 py-2 text-sm font-semibold rounded-borderRoundness border border-white/5 bg-black/35 hover:border-white/10 focus:border-white/20 outline-none text-foregroundHighlighted placeholder:text-foregroundGrey/35 focus:outline-none transition-all duration-200 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider pl-1.5 select-none">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={submitting}
            className="w-full px-3.5 py-2 text-sm font-semibold rounded-borderRoundness border border-white/5 bg-black/35 hover:border-white/10 focus:border-white/20 outline-none text-foregroundHighlighted placeholder:text-foregroundGrey/35 focus:outline-none transition-all duration-200 disabled:opacity-50"
          />
        </div>

        {activeTab === "register" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-extrabold text-foregroundGrey/70 tracking-wider pl-1.5 select-none">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className="w-full px-3.5 py-2 text-sm font-semibold rounded-borderRoundness border border-white/5 bg-black/35 hover:border-white/10 focus:border-white/20 outline-none text-foregroundHighlighted placeholder:text-foregroundGrey/35 focus:outline-none transition-all duration-200 disabled:opacity-50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-xs font-extrabold py-3 mt-2 rounded-borderExtraRoundness bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover text-foreground transition-all duration-200 cursor-pointer text-center select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none shadow-sm hover:shadow-shadowBoxBoxHighlighted"
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
