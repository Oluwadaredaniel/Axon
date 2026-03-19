"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth.store";
import { workspaceAPI, historyAPI, aiAPI } from "@/lib/api";
import { timeAgo, getMethodColor, getStatusColor } from "@/lib/utils";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [wsRes, aiRes] = await Promise.all([
          workspaceAPI.getAll(),
          aiAPI.getUsage(),
        ]);
        setWorkspaces(wsRes.data.workspaces || []);
        setAiUsage(aiRes.data);

        // Load history from first workspace
        if (wsRes.data.workspaces?.length > 0) {
          const hRes = await historyAPI.getWorkspaceHistory(
            wsRes.data.workspaces[0].id,
            { limit: 5 }
          );
          setRecentHistory(hRes.data.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ flex: 1 }}>
      <Header title="Dashboard" />

      <div style={{ padding: "32px" }}>
        {/* Greeting */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800, fontSize: 28,
            color: "var(--text)", letterSpacing: "-1px",
            marginBottom: 6,
          }}>
            {greeting}, {user?.full_name?.split(" ")[0]} 👋
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}>
            Here&apos;s what&apos;s happening with your APIs today.
          </p>
        </motion.div>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16, marginBottom: 32,
        }}>
          {[
            {
              label: "Workspaces",
              value: workspaces.length,
              icon: "◫",
              color: "var(--accent)",
              href: "/dashboard/workspaces",
            },
            {
              label: "Total Routes",
              value: workspaces.reduce((sum, w) => sum + (w.api_routes?.length || 0), 0),
              icon: "⊕",
              color: "var(--accent2)",
              href: "/dashboard/workspaces",
            },
            {
              label: "AI Requests Used",
              value: aiUsage?.used || 0,
              icon: "◈",
              color: "var(--accent3)",
              href: "/dashboard/settings",
            },
            {
              label: "Plan",
              value: user?.plan?.toUpperCase() || "FREE",
              icon: "◇",
              color: "#facc15",
              href: "/dashboard/billing",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i + 1}
            >
              <Link href={stat.href} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, borderColor: "var(--border-strong)" }}
                  className="glass"
                  style={{ borderRadius: 14, padding: "20px 24px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
                    <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 800, fontSize: 32,
                    color: "var(--text)", letterSpacing: "-1px",
                  }}>
                    {loading ? (
                      <div style={{ width: 48, height: 32, background: "var(--surface)", borderRadius: 4 }} />
                    ) : stat.value}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* AI Usage */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={5}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                AI Usage
              </h3>
              {user?.plan === "free" && (
                <Link href="/dashboard/billing" style={{
                  fontSize: 11, color: "var(--accent)", textDecoration: "none",
                  padding: "4px 10px", background: "var(--glow)",
                  border: "1px solid var(--accent)", borderRadius: 6,
                  fontFamily: "var(--font-dm-mono)",
                }}>
                  Upgrade
                </Link>
              )}
            </div>

            {aiUsage && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {aiUsage.used} of {user?.plan === "free" ? aiUsage.limit : "∞"} requests used
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {user?.plan === "free" ? `${aiUsage.percentage}%` : "Unlimited"}
                  </span>
                </div>
                {user?.plan === "free" && (
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 16 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(aiUsage.percentage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        height: "100%", borderRadius: 3,
                        background: aiUsage.percentage > 80 ? "#f87171" : "var(--accent)",
                        boxShadow: `0 0 8px ${aiUsage.percentage > 80 ? "rgba(248,113,113,0.4)" : "var(--glow)"}`,
                      }}
                    />
                  </div>
                )}
                {aiUsage.percentage >= 80 && user?.plan === "free" && (
                  <div style={{
                    padding: "10px 14px",
                    background: "rgba(248,113,113,0.06)",
                    border: "1px solid rgba(248,113,113,0.15)",
                    borderRadius: 8, fontSize: 12, color: "#f87171",
                  }}>
                    ⚠ You&apos;re approaching your limit. Upgrade for unlimited AI requests.
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Workspaces */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={6}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Workspaces
              </h3>
              <Link href="/dashboard/workspaces" style={{
                fontSize: 12, color: "var(--accent)", textDecoration: "none",
                fontFamily: "var(--font-dm-mono)",
              }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2].map((i) => (
                  <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 8 }} />
                ))}
              </div>
            ) : workspaces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 16 }}>
                  No workspaces yet
                </p>
                <Link href="/dashboard/workspaces" className="btn btn-primary" style={{ fontSize: 13, padding: "10px 20px" }}>
                  Create workspace
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {workspaces.slice(0, 3).map((ws) => (
                  <Link key={ws.id} href={`/dashboard/workspaces/${ws.id}`} style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 10, cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: "var(--glow)",
                          border: "1px solid var(--accent)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                        }}>
                          ◫
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{ws.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                            {ws.framework || "No framework"} · {timeAgo(ws.created_at)}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>→</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent History */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={7}
            className="glass"
            style={{ borderRadius: 16, padding: 24, gridColumn: "1 / -1" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Recent Requests
              </h3>
              <Link href="/dashboard/history" style={{
                fontSize: 12, color: "var(--accent)", textDecoration: "none",
                fontFamily: "var(--font-dm-mono)",
              }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 8 }} />
                ))}
              </div>
            ) : recentHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>
                  No requests yet. Start testing your APIs from the VS Code extension.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {recentHistory.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: getMethodColor(req.method),
                      background: `${getMethodColor(req.method)}18`,
                      padding: "2px 8px", borderRadius: 4,
                      fontFamily: "var(--font-dm-mono)",
                      minWidth: 52, textAlign: "center",
                    }}>
                      {req.method}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text)", flex: 1, fontFamily: "var(--font-dm-mono)" }}>
                      {req.url}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: getStatusColor(req.status_code),
                      fontFamily: "var(--font-dm-mono)",
                    }}>
                      {req.status_code}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                      {timeAgo(req.created_at)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}