"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const SEVERITIES = ["all", "error", "warn", "info"];

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getErrorLogs({});
      setLogs(res.data.logs || []);
    } catch {}
    setLoading(false);
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await adminAPI.resolveErrorLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {}
    setResolvingId(null);
  };

  const filtered = logs.filter((l) => {
    const matchesSeverity = severity === "all" || l.severity === severity;
    const matchesSearch = !search ||
      l.message?.toLowerCase().includes(search.toLowerCase()) ||
      l.route?.toLowerCase().includes(search.toLowerCase()) ||
      l.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const counts = {
    error: logs.filter((l) => l.severity === "error").length,
    warn: logs.filter((l) => l.severity === "warn").length,
    info: logs.filter((l) => l.severity === "info").length,
  };

  const severityColor = (s: string) => {
    if (s === "error") return "#f87171";
    if (s === "warn") return "#facc15";
    return "var(--accent)";
  };

  return (
    <div style={{ flex: 1 }}>
      {/* Header */}
      <div style={{
        height: "var(--header-height)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(2,2,10,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            Error Logs
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
            Backend errors from your error_logs table
          </p>
        </div>
        <button onClick={load} className="btn btn-secondary" style={{ fontSize: 12, padding: "8px 16px" }}>
          Refresh
        </button>
      </div>

      <div style={{ padding: 32 }}>

        {/* Severity counts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Errors", value: counts.error, color: "#f87171" },
            { label: "Warnings", value: counts.warn, color: "#facc15" },
            { label: "Info", value: counts.info, color: "var(--accent)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
              className="glass"
              style={{ borderRadius: 12, padding: "16px 20px" }}
            >
              <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 28, color: s.color, letterSpacing: "-1px" }}>
                {loading ? "—" : s.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          style={{ display: "flex", gap: 12, marginBottom: 20 }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by message, route, or user..."
            className="input"
            style={{ flex: 1 }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                style={{
                  padding: "8px 14px", borderRadius: 6,
                  background: severity === s ? "var(--glow)" : "var(--surface)",
                  border: `1px solid ${severity === s ? "var(--accent)" : "var(--border)"}`,
                  color: severity === s ? "var(--accent)" : "var(--text-muted)",
                  fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Logs */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="glass"
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          {loading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 8 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No logs found</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 160px 120px 100px 80px",
                padding: "12px 20px",
                borderBottom: "1px solid var(--border)",
                fontSize: 11, color: "var(--text-subtle)",
                fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                <span>Severity</span>
                <span>Message</span>
                <span>Route</span>
                <span>User</span>
                <span>Time</span>
                <span>Action</span>
              </div>

              {filtered.map((log, i) => (
                <div key={log.id}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr 160px 120px 100px 80px",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--border)",
                      alignItems: "center",
                      cursor: "pointer",
                      background: expanded === log.id ? "rgba(255,255,255,0.02)" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: severityColor(log.severity),
                        boxShadow: `0 0 6px ${severityColor(log.severity)}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, color: severityColor(log.severity), fontFamily: "var(--font-dm-mono)" }}>
                        {log.severity}
                      </span>
                    </div>

                    <span style={{
                      fontSize: 13, color: "var(--text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      paddingRight: 16,
                    }}>
                      {log.message}
                    </span>

                    <span style={{
                      fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-dm-mono)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {log.route || "—"}
                    </span>

                    <span style={{ fontSize: 11, color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.user_email || "—"}
                    </span>

                    <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                      {timeAgo(log.created_at)}
                    </span>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleResolve(log.id); }}
                      disabled={resolvingId === log.id}
                      style={{
                        fontSize: 11, color: "var(--accent3)",
                        background: "transparent", border: "none",
                        cursor: "pointer", fontFamily: "var(--font-dm-mono)",
                        opacity: resolvingId === log.id ? 0.5 : 1,
                      }}
                    >
                      {resolvingId === log.id ? "..." : "Resolve"}
                    </button>
                  </motion.div>

                  {/* Stack trace */}
                  {expanded === log.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        padding: "16px 20px",
                        background: "rgba(0,0,0,0.2)",
                      }}
                    >
                      <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Stack Trace
                      </div>
                      <pre style={{
                        fontSize: 11, color: "var(--text-muted)",
                        fontFamily: "var(--font-dm-mono)",
                        background: "var(--bg)", borderRadius: 8,
                        padding: 16, overflow: "auto",
                        maxHeight: 240, whiteSpace: "pre-wrap",
                        wordBreak: "break-all", margin: 0,
                      }}>
                        {log.stack_trace || log.message}
                      </pre>
                      {log.metadata && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            Metadata
                          </div>
                          <pre style={{
                            fontSize: 11, color: "var(--text-muted)",
                            fontFamily: "var(--font-dm-mono)",
                            background: "var(--bg)", borderRadius: 8,
                            padding: 16, overflow: "auto",
                            maxHeight: 120, whiteSpace: "pre-wrap",
                            wordBreak: "break-all", margin: 0,
                          }}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}