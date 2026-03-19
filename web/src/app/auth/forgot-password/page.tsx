"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { authAPI } from "@/lib/api";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return setError("Email is required");
    setError("");
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass"
        style={{ borderRadius: 20, padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(79,138,255,0.1)",
          border: "1px solid rgba(79,138,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: 28,
        }}>
          📬
        </div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 28, color: "var(--text)", letterSpacing: "-1px", marginBottom: 12 }}>
          Check your inbox
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 32, fontWeight: 300 }}>
          We sent a reset link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
          Check your inbox and follow the instructions.
        </p>
        <Link href="/auth/login" className="btn btn-primary" style={{ display: "block", textAlign: "center" }}>
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 36, color: "var(--text)", letterSpacing: "-1.5px", marginBottom: 10 }}
        >
          Reset password
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}
        >
          Enter your email and we&apos;ll send you a reset link.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass"
        style={{ borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: "12px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, fontSize: 13, color: "#f87171", marginBottom: 20 }}
          >
            {error}
          </motion.div>
        )}

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
            Email address
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

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", marginBottom: 16 }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }}
            />
          ) : "Send reset link"}
        </button>

        <Link href="/auth/login" style={{ display: "block", textAlign: "center", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          ← Back to sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}