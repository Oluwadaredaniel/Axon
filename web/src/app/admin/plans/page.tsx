"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPlans();
      setPlans(res.data.plans || []);
    } catch {}
    setLoading(false);
  };

  const handleEdit = (plan: any) => {
    setEditing({ ...plan });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await adminAPI.updatePlan(editing.id, {
        price: Number(editing.price),
        ai_requests_limit: Number(editing.ai_requests_limit),
        workspace_limit: Number(editing.workspace_limit),
        history_days: Number(editing.history_days),
        team_members_limit: Number(editing.team_members_limit),
      });
      setPlans((prev) => prev.map((p) => p.id === editing.id ? editing : p));
      setSaved(editing.id);
      setTimeout(() => { setSaved(null); setEditing(null); }, 1500);
    } catch {}
    setSaving(false);
  };

  const PLAN_COLORS: Record<string, string> = {
    free: "var(--text-muted)",
    pro: "var(--accent)",
    team: "var(--accent2)",
  };

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
          Plans
        </h1>
      </div>

      <div style={{ padding: 32 }}>
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, fontWeight: 300 }}
        >
          Manage plan limits and pricing. Changes take effect immediately for new subscribers.
        </motion.p>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 320, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {plans.map((plan, i) => {
              const isEditing = editing?.id === plan.id;
              const color = PLAN_COLORS[plan.name] || "var(--accent)";
              const current = isEditing ? editing : plan;

              return (
                <motion.div
                  key={plan.id}
                  variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                  className="glass"
                  style={{
                    borderRadius: 16, padding: 24,
                    position: "relative", overflow: "hidden",
                    borderColor: isEditing ? color : "var(--border)",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

                  {/* Plan name */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color, fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                        {plan.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 28, color: "var(--text)", letterSpacing: "-1px" }}>
                        ${isEditing ? (
                          <input
                            type="number"
                            value={editing.price}
                            onChange={(e) => setEditing((prev: any) => ({ ...prev, price: e.target.value }))}
                            style={{
                              width: 60, background: "transparent",
                              border: "none", borderBottom: `1px solid ${color}`,
                              color: "var(--text)", fontFamily: "var(--font-syne)",
                              fontWeight: 800, fontSize: 28, outline: "none",
                            }}
                          />
                        ) : plan.price}
                        <span style={{ fontSize: 13, color: "var(--text-subtle)", fontWeight: 400 }}>/mo</span>
                      </div>
                    </div>
                    {saved === plan.id && (
                      <span style={{ fontSize: 12, color: "var(--accent3)", fontFamily: "var(--font-dm-mono)" }}>✓ Saved</span>
                    )}
                  </div>

                  {/* Fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "AI Requests/mo", field: "ai_requests_limit" },
                      { label: "Workspaces", field: "workspace_limit" },
                      { label: "History days", field: "history_days" },
                      { label: "Team members", field: "team_members_limit" },
                    ].map(({ label, field }) => (
                      <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                          {label}
                        </span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={(editing as any)[field]}
                            onChange={(e) => setEditing((prev: any) => ({ ...prev, [field]: e.target.value }))}
                            style={{
                              width: 80, padding: "4px 8px",
                              background: "var(--input-bg)",
                              border: `1px solid ${color}40`,
                              borderRadius: 6,
                              color: "var(--text)", fontFamily: "var(--font-dm-mono)",
                              fontSize: 12, outline: "none", textAlign: "right",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                            {(plan as any)[field] === -1 ? "∞" : (plan as any)[field]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setEditing(null)}
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: 12 }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: 12 }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(plan)}
                      className="btn btn-secondary"
                      style={{ width: "100%", fontSize: 12 }}
                    >
                      Edit plan
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}