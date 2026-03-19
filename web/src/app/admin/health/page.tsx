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

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setChecking(true);
    try {
      const res = await adminAPI.getSystemHealth();
      setHealth(res.data);
      setLastChecked(new Date());
    } catch {}
    setLoading(false);
    setChecking(false);
  };

  const statusColor = (status: string) => {
    if (status === "ok" || status === "healthy") return "var(--accent3)";
    if (status === "degraded" || status === "slow") return "#facc15";
    return "#f87171";
  };

  const statusDot = (status: string) => (
    <motion.div
      animate={{ scale: status === "ok" || status === "healthy" ? [1, 1.3, 1] : 1, opacity: status === "error" || status === "down" ? [1, 0.4, 1] : 1 }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        width: 8, height: 8, borderRadius: "50%",
        background: statusColor(status),
        boxShadow: `0 0 8px ${statusColor(status)}`,
        flexShrink: 0,
      }}
    />
  );

  const services = [
    { key: "database", label: "Supabase Database", icon: "◈" },
    { key: "email", label: "Resend Email", icon: "◉" },
    { key: "stripe", label: "Stripe Payments", icon: "◇" },
    { key: "groq", label: "Groq AI", icon: "⬡" },
    { key: "gemini", label: "Gemini AI", icon: "⬡" },
    { key: "mistral", label: "Mistral AI", icon: "⬡" },
  ];

  const cronJobs = [
    { key: "ai_reset", label: "Monthly AI Reset" },
    { key: "weekly_emails", label: "Weekly Summary Emails" },
    { key: "limit_checks", label: "Limit Warning Checks" },
  ];

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
            System Health
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
            {lastChecked ? `Last checked ${timeAgo(lastChecked.toISOString())}` : "Checking..."}
          </p>
        </div>
        <button
          onClick={load}
          disabled={checking}
          className="btn btn-secondary"
          style={{ fontSize: 12, padding: "8px 16px" }}
        >
          {checking ? "Checking..." : "Refresh"}
        </button>
      </div>

      <div style={{ padding: 32 }}>

        {/* Overall status banner */}
        {!loading && health && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            style={{
              padding: "16px 24px",
              borderRadius: 12,
              marginBottom: 28,
              background: health.overall === "healthy"
                ? "rgba(52,211,153,0.06)"
                : health.overall === "degraded"
                  ? "rgba(250,204,21,0.06)"
                  : "rgba(248,113,113,0.06)",
              border: `1px solid ${health.overall === "healthy" ? "rgba(52,211,153,0.2)" : health.overall === "degraded" ? "rgba(250,204,21,0.2)" : "rgba(248,113,113,0.2)"}`,
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            {statusDot(health.overall)}
            <div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-syne)" }}>
                {health.overall === "healthy"
                  ? "All systems operational"
                  : health.overall === "degraded"
                    ? "Some services degraded"
                    : "System issues detected"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
                Uptime: {health.uptime || "—"} · Response time: {health.avg_response_time ? `${health.avg_response_time}ms` : "—"}
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Services */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Services
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ height: 48, background: "var(--surface)", borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {services.map((svc, i) => {
                  const status = health?.services?.[svc.key] || "unknown";
                  return (
                    <motion.div
                      key={svc.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>{svc.icon}</span>
                        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{svc.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {health?.response_times?.[svc.key] && (
                          <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                            {health.response_times[svc.key]}ms
                          </span>
                        )}
                        {statusDot(status)}
                        <span style={{ fontSize: 11, color: statusColor(status), fontFamily: "var(--font-dm-mono)" }}>
                          {status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Cron jobs */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Cron Jobs
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 72, background: "var(--surface)", borderRadius: 8 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cronJobs.map((job, i) => {
                  const data = health?.cron_jobs?.[job.key];
                  const status = data?.status || "unknown";
                  return (
                    <motion.div
                      key={job.key}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{
                        padding: "14px 16px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{job.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {statusDot(status)}
                          <span style={{ fontSize: 11, color: statusColor(status), fontFamily: "var(--font-dm-mono)" }}>
                            {status}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                          Last run: {data?.last_run ? timeAgo(data.last_run) : "Never"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                          Next: {data?.next_run ? timeAgo(data.next_run) : "—"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* API response times */}
            {!loading && health?.api_routes && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 14 }}>
                  API Response Times
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(health.api_routes).map(([route, ms]: any, i) => {
                    const pct = Math.min((ms / 1000) * 100, 100);
                    const color = ms < 200 ? "var(--accent3)" : ms < 500 ? "#facc15" : "#f87171";
                    return (
                      <div key={route}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>{route}</span>
                          <span style={{ fontSize: 11, color, fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>{ms}ms</span>
                        </div>
                        <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            style={{ height: "100%", borderRadius: 2, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Stripe webhook status */}
        {!loading && health?.stripe_webhook && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Stripe Webhook
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Status", value: health.stripe_webhook.status, isStatus: true },
                { label: "Last Event", value: health.stripe_webhook.last_event ? timeAgo(health.stripe_webhook.last_event) : "—" },
                { label: "Events Today", value: health.stripe_webhook.events_today ?? "—" },
                { label: "Failed Events", value: health.stripe_webhook.failed_events ?? "—" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontSize: 16, fontFamily: "var(--font-syne)", fontWeight: 700,
                    color: s.isStatus ? statusColor(s.value) : "var(--text)",
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}