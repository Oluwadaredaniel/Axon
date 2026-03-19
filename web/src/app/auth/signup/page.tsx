"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signUp, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!fullName || !email || !password) return setError("All fields are required");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    setError("");
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleGithub = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/github`;
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{ borderRadius: 20, padding: 48, textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(52,211,153,0.1)",
            border: "1px solid rgba(52,211,153,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 28,
          }}
        >
          ✓
        </motion.div>
        <h2 style={{
          fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 28,
          color: "var(--text)", letterSpacing: "-1px", marginBottom: 12,
        }}>
          Check your email
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 32, fontWeight: 300 }}>
          We sent a verification link to <strong style={{ color: "var(--text)" }}>{email}</strong>.
          Click the link to activate your account.
        </p>
        <button onClick={() => router.push("/auth/login")} className="btn btn-primary" style={{ width: "100%" }}>
          Go to sign in
        </button>
      </motion.div>
    );
  }

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
          transition={{ delay: 0.1 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 100,
            fontSize: 12, color: "var(--text-muted)", marginBottom: 24,
            fontFamily: "var(--font-dm-mono)",
          }}
        >
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)", boxShadow: "0 0 8px var(--accent)",
          }} />
          Free forever — no credit card needed
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontFamily: "var(--font-syne)", fontWeight: 800,
            fontSize: 36, color: "var(--text)",
            letterSpacing: "-1.5px", marginBottom: 10,
          }}
        >
          Create your account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Sign in
          </Link>
        </motion.p>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass"
        style={{ borderRadius: 20, padding: 32, position: "relative", overflow: "hidden" }}
      >
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }} />

        {/* GitHub */}
        <button onClick={handleGithub} className="btn btn-secondary" style={{ width: "100%", marginBottom: 24 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
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
              borderRadius: 10, fontSize: 13, color: "#f87171", marginBottom: 20,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="input"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Min. 8 characters"
              className="input"
            />
          </div>
        </div>

        {/* Password strength */}
        {password.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {[1, 2, 3, 4].map((level) => (
                <div key={level} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: password.length >= level * 2
                    ? level <= 1 ? "#f87171"
                      : level <= 2 ? "#facc15"
                        : level <= 3 ? "#4f8aff"
                          : "#34d399"
                    : "var(--border)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-subtle)" }}>
              {password.length < 4 ? "Too weak" :
                password.length < 6 ? "Weak" :
                  password.length < 8 ? "Almost there" : "Strong password"}
            </p>
          </div>
        )}

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
                width: 16, height: 16,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white", borderRadius: "50%",
              }}
            />
          ) : "Create account"}
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          textAlign: "center", fontSize: 12,
          color: "var(--text-subtle)", marginTop: 24, lineHeight: 1.8,
        }}
      >
        By signing up you agree to our{" "}
        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Terms</a>
        {" "}and{" "}
        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Privacy Policy</a>
      </motion.p>
    </motion.div>
  );
}