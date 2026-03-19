"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password) return setError("All fields are required");
    setError("");
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  const handleGithub = async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/github`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 100,
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 24,
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent3)",
            boxShadow: "0 0 8px var(--accent3)",
          }} />
          Welcome back
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: 36,
            color: "var(--text)",
            letterSpacing: "-1.5px",
            marginBottom: 10,
          }}
        >
          Sign in to Axon
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Sign up free
          </Link>
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="glass"
        style={{ borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}
      >
        {/* Top shine */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }} />

        {/* GitHub button */}
        <button
          onClick={handleGithub}
          className="btn btn-secondary"
          style={{ width: "100%", marginBottom: 24 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "12px 16px",
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 10,
              fontSize: 13,
              color: "#f87171",
              marginBottom: 20,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{
              display: "block", fontSize: 12, color: "var(--text-muted)",
              marginBottom: 8, fontFamily: "var(--font-dm-mono)",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                Password
              </label>
              <Link href="/auth/forgot-password" style={{
                fontSize: 12, color: "var(--accent)", textDecoration: "none",
              }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="input"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white", borderRadius: "50%",
              }}
            />
          ) : "Sign in"}
        </button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          textAlign: "center", fontSize: 12, color: "var(--text-subtle)",
          marginTop: 24, lineHeight: 1.8,
        }}
      >
        By signing in you agree to our{" "}
        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms</a>
        {" "}and{" "}
        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</a>
      </motion.p>
    </motion.div>
  );
}