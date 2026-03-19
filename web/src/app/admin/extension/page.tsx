"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function ExtensionAnalyticsPage() {
  const [marketplace, setMarketplace] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loadingMarketplace, setLoadingMarketplace] = useState(true);
  const [loadingErrors, setLoadingErrors] = useState(true);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadMarketplace();
    loadErrors();
  }, []);

  const loadMarketplace = async () => {
    setLoadingMarketplace(true);
    try {
      const res = await adminAPI.getExtensionStats();
      setMarketplace(res.data);
    } catch {}
    setLoadingMarketplace(false);
  };

  const loadErrors = async () => {
    setLoadingErrors(true);
    try {
      const res = await adminAPI.getErrorLogs({ source: "extension" });
      setErrors(res.data.logs || []);
    } catch {}
    setLoadingErrors(false);
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await adminAPI.resolveErrorLog(id);
      setErrors((prev) => prev.filter((e) => e.id !== id));
    } catch {}
    setResolvingId(null);
  };

  const stats = [
    { label: "Total Installs", value: marketplace?.installs ?? "—", color: "var(--accent)", icon: "⬇" },
    { label: "Active Users", value: marketplace?.active_users ?? "—", color: "var(--accent3)", icon: "◉" },
    { label: "Uninstall Rate", value: marketplace?.uninstall_rate ? `${marketplace.uninstall_rate}%` : "—", color: "#f87171", icon: "◎" },
    { label: "Latest Version", value: marketplace?.latest_version ?? "—", color: "var(--accent2)", icon: "◈" },
  ];

  return (
    <div style={{ flex: 1 }}>
      {/* Header */}
      <div style={{
        height: "var(--header-height)",
        display: "flex", alignItems: "center",
        padding: "0 32px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(2,2,10,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            Extension Analytics
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
            VS Code marketplace · live data
          </p>
        </div>
      </div>

      <div style={{ padding: 32 }}>

        {/* Marketplace stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className="glass"
              style={{ borderRadius: 14, padding: "20px 24px" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
                <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color: s.color, letterSpacing: "-1px" }}>
                {loadingMarketplace
                  ? <div style={{ width: 60, height: 32, background: "var(--surface)", borderRadius: 4 }} />
                  : s.value}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Install trend chart */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Install Trend
            </h3>
            {loadingMarketplace ? (
              <div style={{ height: 200, background: "var(--surface)", borderRadius: 8 }} />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={marketplace?.install_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "var(--text)", fontFamily: "var(--font-dm-mono)" }}
                  />
                  <Line type="monotone" dataKey="installs" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Version distribution */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={5}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Version Distribution
            </h3>
            {loadingMarketplace ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => <div key={i} style={{ height: 36, background: "var(--surface)", borderRadius: 8 }} />)}
              </div>
            ) : (marketplace?.version_distribution || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No version data yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(marketplace?.version_distribution || []).map((v: any, i: number) => (
                  <div key={v.version}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                        v{v.version}
                        {i === 0 && (
                          <span style={{ marginLeft: 8, fontSize: 10, color: "var(--accent3)", background: "rgba(52,211,153,0.1)", padding: "1px 6px", borderRadius: 3 }}>
                            latest
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                        {v.count} <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>({v.pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v.pct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                        style={{ height: "100%", borderRadius: 2, background: i === 0 ? "var(--accent3)" : "var(--accent)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Extension error logs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={6}
          className="glass"
          style={{ borderRadius: 16, padding: 24 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
              Extension Error Logs
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
              {errors.length} unresolved
            </span>
          </div>

          {loadingErrors ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 8 }} />)}
            </div>
          ) : errors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No extension errors reported</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {errors.map((err, i) => (
                <motion.div
                  key={err.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: err.severity === "error" ? "#f87171" : err.severity === "warn" ? "#facc15" : "var(--accent)",
                      boxShadow: `0 0 6px ${err.severity === "error" ? "#f87171" : err.severity === "warn" ? "#facc15" : "var(--accent)"}`,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {err.message}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
                        v{err.extension_version} · {err.user_email || "anonymous"} · {timeAgo(err.created_at)}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                      {expandedError === err.id ? "▲" : "▼"}
                    </span>
                  </div>

                  {expandedError === err.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{ borderTop: "1px solid var(--border)", padding: "12px 16px" }}
                    >
                      <pre style={{
                        fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)",
                        background: "var(--bg)", borderRadius: 6, padding: 12,
                        overflow: "auto", marginBottom: 12, maxHeight: 200,
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                      }}>
                        {err.stack_trace || err.message}
                      </pre>
                      <button
                        onClick={() => handleResolve(err.id)}
                        disabled={resolvingId === err.id}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: "6px 14px" }}
                      >
                        {resolvingId === err.id ? "Resolving..." : "Mark resolved"}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}