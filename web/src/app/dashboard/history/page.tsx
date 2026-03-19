"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { historyAPI } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getMethodColor, getMethodBg, getStatusColor, timeAgo, formatDuration } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function HistoryPage() {
  const { workspaces, fetchAll } = useWorkspaceStore();
  const [selectedWs, setSelectedWs] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWs) {
      setSelectedWs(workspaces[0].id);
    }
  }, [workspaces]);

  useEffect(() => {
    if (!selectedWs) return;
    loadHistory();
    loadStats();
  }, [selectedWs]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await historyAPI.getWorkspaceHistory(selectedWs, { limit: 50 });
      setHistory(res.data.history || []);
    } catch {}
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const res = await historyAPI.getStats(selectedWs);
      setStats(res.data);
    } catch {}
  };

  const filtered = history.filter((h) => {
    if (filter === "success") return h.status_code < 400;
    if (filter === "error") return h.status_code >= 400;
    return true;
  });

  return (
    <div style={{ flex: 1 }}>
      <Header title="History" />
      <div style={{ padding: 32 }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Total Requests", value: stats.total, color: "var(--accent)" },
              { label: "Success Rate", value: `${stats.success_rate}%`, color: "var(--accent3)" },
              { label: "Avg Duration", value: `${stats.avg_duration}ms`, color: "var(--accent2)" },
              { label: "Errors", value: stats.errors, color: "#f87171" },
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
                  {s.value}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}
        >
          <select
            value={selectedWs}
            onChange={(e) => setSelectedWs(e.target.value)}
            style={{
              padding: "10px 16px", background: "var(--input-bg)",
              border: "1px solid var(--input-border)", borderRadius: 8,
              color: "var(--text)", fontFamily: "var(--font-dm-mono)", fontSize: 13,
              outline: "none", cursor: "pointer",
            }}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>

          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "success", "error"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 16px", borderRadius: 6,
                  background: filter === f ? "var(--glow)" : "var(--surface)",
                  border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
                  color: filter === f ? "var(--accent)" : "var(--text-muted)",
                  fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
            {filtered.length} requests
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
          className="glass"
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 80px 80px 120px 100px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-subtle)",
            fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span>Method</span>
            <span>URL</span>
            <span>Status</span>
            <span>Duration</span>
            <span>Time</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 6, marginBottom: 6 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No requests found</p>
            </div>
          ) : (
            filtered.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 80px 80px 120px 100px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  cursor: "pointer",
                  background: selected?.id === req.id ? "rgba(79,138,255,0.04)" : "transparent",
                  transition: "background 0.15s",
                }}
                onClick={() => setSelected(selected?.id === req.id ? null : req)}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: getMethodColor(req.method),
                  background: getMethodBg(req.method),
                  padding: "2px 8px", borderRadius: 4,
                  fontFamily: "var(--font-dm-mono)",
                  display: "inline-block",
                }}>
                  {req.method}
                </span>
                <span style={{
                  fontSize: 12, color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-mono)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  paddingRight: 16,
                }}>
                  {req.url}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: getStatusColor(req.status_code),
                  fontFamily: "var(--font-dm-mono)",
                }}>
                  {req.status_code}
                </span>
                <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                  {req.duration_ms}ms
                </span>
                <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                  {timeAgo(req.created_at)}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelected(req); }}
                  style={{
                    fontSize: 11, color: "var(--accent)", background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "var(--font-dm-mono)",
                  }}
                >
                  View →
                </button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Detail panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass"
            style={{ borderRadius: 16, padding: 24, marginTop: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Request Details
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                  Request
                </div>
                <pre style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", lineHeight: 1.6, background: "var(--input-bg)", borderRadius: 8, padding: 14, overflow: "auto", maxHeight: 200 }}>
                  {JSON.stringify({ headers: selected.request_headers, body: selected.request_body }, null, 2)}
                </pre>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                  Response
                </div>
                <pre style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", lineHeight: 1.6, background: "var(--input-bg)", borderRadius: 8, padding: 14, overflow: "auto", maxHeight: 200 }}>
                  {JSON.stringify(selected.response_body, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}