"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { billingAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    color: "var(--text-muted)",
    features: [
      "1 workspace",
      "50 AI requests/month",
      "30 days history",
      "Express & NestJS support",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "per month",
    color: "var(--accent)",
    popular: true,
    features: [
      "3 workspaces",
      "1,000 AI requests/month",
      "Unlimited history",
      "Priority AI fallback",
      "Email support",
      "API key access",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: "$24",
    period: "per month",
    color: "var(--accent2)",
    features: [
      "Unlimited workspaces",
      "5,000 AI requests/month",
      "Unlimited history",
      "10 team members",
      "Role-based access",
      "Priority support",
      "Admin dashboard",
    ],
  },
];

export default function BillingPage() {
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await billingAPI.getBilling();
      setBilling(res.data);
    } catch {}
    setLoading(false);
  };

  const handleUpgrade = async (planId: string) => {
    if (planId === user?.plan) return;
    setUpgrading(planId);
    try {
      const res = await billingAPI.createCheckout(planId);
      window.location.href = res.data.url;
    } catch {
      setUpgrading(null);
    }
  };

  const handleManage = async () => {
    try {
      const res = await billingAPI.createPortal();
      window.location.href = res.data.url;
    } catch {}
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    try {
      await billingAPI.cancel();
      await load();
    } catch {}
    setCancelling(false);
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Billing" />
      <div style={{ padding: 32 }}>

        {/* Current plan banner */}
        {user && (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="glass"
            style={{
              borderRadius: 16, padding: 24, marginBottom: 32,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              position: "relative", overflow: "hidden",
              borderColor: "var(--border-strong)",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "var(--accent)", borderRadius: "16px 0 0 16px" }} />

            <div style={{ paddingLeft: 16 }}>
              <div style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Current plan
              </div>
              <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.5px" }}>
                {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1)}
              </div>
              {billing?.subscription?.current_period_end && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Renews {new Date(billing.subscription.current_period_end * 1000).toLocaleDateString()}
                </div>
              )}
            </div>

            {user.plan !== "free" && (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleManage}
                  className="btn btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Manage billing
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="btn btn-danger"
                  style={{ fontSize: 13 }}
                >
                  {cancelling ? "Cancelling..." : "Cancel plan"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Plans */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          style={{ marginBottom: 12 }}
        >
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>
            Plans
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}>
            Upgrade to unlock more AI requests, workspaces, and team features.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PLANS.map((plan, i) => {
            const isCurrent = user?.plan === plan.id;
            return (
              <motion.div
                key={plan.id}
                variants={fadeUp} initial="hidden" animate="visible" custom={i + 2}
                className="glass"
                style={{
                  borderRadius: 16, padding: 24,
                  position: "relative", overflow: "hidden",
                  borderColor: isCurrent ? plan.color : plan.popular ? "rgba(79,138,255,0.2)" : "var(--border)",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${plan.color}40, transparent)` }} />

                {plan.popular && !isCurrent && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    fontSize: 10, color: "var(--accent)",
                    background: "var(--glow)", border: "1px solid var(--accent)",
                    padding: "2px 8px", borderRadius: 4,
                    fontFamily: "var(--font-dm-mono)",
                  }}>
                    POPULAR
                  </div>
                )}

                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    fontSize: 10, color: "var(--accent3)",
                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
                    padding: "2px 8px", borderRadius: 4,
                    fontFamily: "var(--font-dm-mono)",
                  }}>
                    CURRENT
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: plan.color, fontFamily: "var(--font-dm-mono)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 36, color: "var(--text)", letterSpacing: "-1.5px" }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>/{plan.period}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)" }}>
                      <span style={{ color: plan.color, fontSize: 12 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgrading === plan.id}
                  className={isCurrent ? "btn btn-secondary" : "btn btn-primary"}
                  style={{
                    width: "100%", fontSize: 13,
                    background: isCurrent ? undefined : plan.id === "team" ? "var(--accent2)" : undefined,
                    opacity: isCurrent ? 0.5 : 1,
                    cursor: isCurrent ? "not-allowed" : "pointer",
                  }}
                >
                  {upgrading === plan.id ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }}
                    />
                  ) : isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}