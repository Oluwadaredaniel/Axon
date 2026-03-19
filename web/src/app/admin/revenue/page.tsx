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

export default function AdminRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getRevenue();
      setData(res.data);
    } catch {}
    setLoading(false);
  };

  const stats = [
    { label: "Monthly Revenue", value: `$${data?.monthly || 0}`, color: "#facc15", icon: "◈" },
    { label: "Annual Run Rate", value: `$${(data?.monthly || 0) * 12}`, color: "var(--accent3)", icon: "◇" },
    { label: "Pro Subscribers", value: data?.pro_count || 0, color: "var(--accent)", icon: "⊕" },
    { label: "Team Subscribers", value: data?.team_count || 0, color: "var(--accent2)", icon: "◎" },
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
          Revenue
        </h1>
      </div>

      <div style={{ padding: 32 }}>

        {/* Stats */}
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
                {loading ? <div style={{ width: 60, height: 32, background: "var(--surface)", borderRadius: 4 }} /> : s.value}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Revenue breakdown */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Revenue Breakdown
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Pro Plan ($9/mo)", count: data?.pro_count || 0, price: 9, color: "var(--accent)" },
                { label: "Team Plan ($24/mo)", count: data?.team_count || 0, price: 24, color: "var(--accent2)" },
              ].map((plan) => {
                const revenue = plan.count * plan.price;
                const total = (data?.monthly || 1);
                const pct = total > 0 ? (revenue / total) * 100 : 0;
                return (
                  <div key={plan.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{plan.label}</span>
                      <span style={{ fontSize: 13, color: plan.color, fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                        ${revenue}/mo
                      </span>
                    </div>
                    <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 6 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: plan.color }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                      {plan.count} subscribers · {pct.toFixed(1)}% of revenue
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div style={{
              marginTop: 20, paddingTop: 20,
              borderTop: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>Total MRR</span>
              <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 24, color: "#facc15", letterSpacing: "-0.5px" }}>
                ${data?.monthly || 0}
              </span>
            </div>
          </motion.div>

          {/* Recent transactions */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={5}
            className="glass"
            style={{ borderRadius: 16, padding: 24 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
              Recent Transactions
            </h3>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 8 }} />
                ))}
              </div>
            ) : (data?.transactions || []).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(data?.transactions || []).map((tx: any, i: number) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>
                        {tx.user_name || tx.email}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                        {tx.plan} · {timeAgo(tx.created_at)}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16,
                      color: "#facc15",
                    }}>
                      ${tx.amount}
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