"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  const stats = [
    { label: "Total Users", value: data?.stats?.total_users || 0, icon: "◎", color: "var(--accent)", href: "/admin/users" },
    { label: "Active Today", value: data?.stats?.active_today || 0, icon: "⊕", color: "var(--accent3)", href: "/admin/users" },
    { label: "Monthly Revenue", value: `$${data?.stats?.monthly_revenue || 0}`, icon: "◈", color: "#facc15", href: "/admin/revenue" },
    { label: "Pro Users", value: data?.stats?.pro_users || 0, icon: "◇", color: "var(--accent2)", href: "/admin/plans" },
    { label: "Team Users", value: data?.stats?.team_users || 0, icon: "◫", color: "#f87171", href: "/admin/plans" },
    { label: "Waitlist", value: data?.stats?.waitlist_count || 0, icon: "◷", color: "var(--text-muted)", href: "/admin/waitlist" },
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
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
          Admin Overview
        </h1>
      </div>

      <div style={{ padding: 32 }}>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeUp} initial="hidden" animate="visible" custom={i}>
              <Link href={stat.href} style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="glass"
                  style={{ borderRadius: 14, padding: "20px 24px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 18, color: stat.color }}>{stat.icon}</span>
                    <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 32, color: "var(--text)", letterSpacing: "-1px" }}>
                    {loading ? <div style={{ width: 60, height: 32, background: "var(--surface)", borderRadius: 4 }} /> : stat.value}
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Recent users */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6} className="glass" style={{ borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Recent Users
              </h3>
              <Link href="/admin/users" style={{ fontSize: 12, color: "var(--accent2)", textDecoration: "none", fontFamily: "var(--font-dm-mono)" }}>
                View all →
              </Link>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 8 }} />)}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(data?.recent_users || []).slice(0, 5).map((u: any, i: number) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "white", fontWeight: 700, flexShrink: 0,
                    }}>
                      {u.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.full_name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{u.email}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 4,
                      background: u.plan === "pro" ? "var(--glow)" : u.plan === "team" ? "rgba(167,139,250,0.1)" : "var(--surface)",
                      color: u.plan === "pro" ? "var(--accent)" : u.plan === "team" ? "var(--accent2)" : "var(--text-subtle)",
                      border: `1px solid ${u.plan === "pro" ? "var(--accent)" : u.plan === "team" ? "var(--accent2)" : "var(--border)"}`,
                      fontFamily: "var(--font-dm-mono)",
                    }}>
                      {u.plan}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Plan distribution */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7} className="glass" style={{ borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Plan Distribution
              </h3>
              <Link href="/admin/plans" style={{ fontSize: 12, color: "var(--accent2)", textDecoration: "none", fontFamily: "var(--font-dm-mono)" }}>
                Manage →
              </Link>
            </div>

            {data?.stats && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Free", value: data.stats.free_users || 0, total: data.stats.total_users, color: "var(--text-muted)" },
                  { label: "Pro", value: data.stats.pro_users || 0, total: data.stats.total_users, color: "var(--accent)" },
                  { label: "Team", value: data.stats.team_users || 0, total: data.stats.total_users, color: "var(--accent2)" },
                ].map((plan) => (
                  <div key={plan.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>{plan.label}</span>
                      <span style={{ fontSize: 13, color: plan.color, fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                        {plan.value} <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>({plan.total ? Math.round((plan.value / plan.total) * 100) : 0}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${plan.total ? (plan.value / plan.total) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 2, background: plan.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI usage */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8} className="glass" style={{ borderRadius: 16, padding: 24, gridColumn: "1 / -1" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Top AI Users
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 8 }} />)}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px", gap: 0 }}>
                <div style={{ display: "contents" }}>
                  {["User", "Plan", "AI Requests", "Joined"].map((h) => (
                    <div key={h} style={{ padding: "8px 12px", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border)" }}>
                      {h}
                    </div>
                  ))}
                </div>
                {(data?.top_ai_users || []).slice(0, 5).map((u: any, i: number) => (
                  <div key={u.id} style={{ display: "contents" }}>
                    <div style={{ padding: "12px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700 }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{u.full_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ padding: "12px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-dm-mono)" }}>{u.plan}</span>
                    </div>
                    <div style={{ padding: "12px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>{u.ai_requests_used}</span>
                    </div>
                    <div style={{ padding: "12px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>{timeAgo(u.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}