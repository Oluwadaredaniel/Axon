"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const DISCOUNT_TYPES = [
  { value: "percent", label: "% Off" },
  { value: "fixed", label: "$ Fixed" },
];

const PLAN_TARGETS = [
  { value: "all", label: "All Plans" },
  { value: "pro", label: "Pro Only" },
  { value: "team", label: "Team Only" },
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [planTarget, setPlanTarget] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(res.data.coupons || []);
    } catch {}
    setLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const result = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    setCode(result);
  };

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) return;
    setCreating(true);
    try {
      await adminAPI.createCoupon({
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt || null,
        plan_target: planTarget,
      });
      setCreated(true);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      setPlanTarget("all");
      setDiscountType("percent");
      setShowForm(false);
      await load();
      setTimeout(() => setCreated(false), 3000);
    } catch {}
    setCreating(false);
  };

  const handleDeactivate = async (id: string) => {
    try {
      await adminAPI.deactivateCoupon(id);
      setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active: false } : c));
    } catch {}
  };

  const usagePct = (used: number, max: number | null) => {
    if (!max) return null;
    return Math.min((used / max) * 100, 100);
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
            Coupons
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
            Create and manage discount codes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ fontSize: 13, padding: "8px 20px" }}
        >
          {showForm ? "Cancel" : "+ New Coupon"}
        </button>
      </div>

      <div style={{ padding: 32 }}>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              style={{ overflow: "hidden", marginBottom: 28 }}
            >
              <div className="glass" style={{ borderRadius: 16, padding: 28 }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 24 }}>
                  Create Coupon
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                  {/* Code */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Coupon Code
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LAUNCH50"
                        className="input"
                        style={{ flex: 1, fontFamily: "var(--font-dm-mono)", letterSpacing: "0.1em" }}
                      />
                      <button
                        onClick={generateCode}
                        className="btn btn-secondary"
                        style={{ fontSize: 11, padding: "0 14px", whiteSpace: "nowrap" }}
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Discount value */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Discount
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {DISCOUNT_TYPES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setDiscountType(t.value)}
                            style={{
                              padding: "8px 14px",
                              background: discountType === t.value ? "var(--glow)" : "var(--surface)",
                              border: `1px solid ${discountType === t.value ? "var(--accent)" : "var(--border)"}`,
                              borderRadius: 6,
                              color: discountType === t.value ? "var(--accent)" : "var(--text-muted)",
                              fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "percent" ? "e.g. 50" : "e.g. 5"}
                        className="input"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  {/* Max uses */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Max Uses (leave blank for unlimited)
                    </label>
                    <input
                      type="number"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      placeholder="e.g. 100"
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Expiry */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Expires At (leave blank for no expiry)
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Plan target */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Applies To
                    </label>
                    <div style={{ display: "flex", gap: 6 }}>
                      {PLAN_TARGETS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setPlanTarget(p.value)}
                          style={{
                            padding: "8px 20px",
                            background: planTarget === p.value ? "var(--glow)" : "var(--surface)",
                            border: `1px solid ${planTarget === p.value ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: 6,
                            color: planTarget === p.value ? "var(--accent)" : "var(--text-muted)",
                            fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !code.trim() || !discountValue}
                    className="btn btn-primary"
                    style={{ fontSize: 13, padding: "10px 28px" }}
                  >
                    {creating ? "Creating..." : created ? "✓ Created!" : "Create Coupon"}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: 13, padding: "10px 20px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Coupons", value: coupons.length, color: "var(--accent)" },
            { label: "Active", value: coupons.filter((c) => c.is_active).length, color: "var(--accent3)" },
            { label: "Total Redemptions", value: coupons.reduce((acc, c) => acc + (c.uses || 0), 0), color: "var(--accent2)" },
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

        {/* Coupons table */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="glass"
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "160px 100px 100px 1fr 120px 100px 80px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-subtle)",
            fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span>Code</span>
            <span>Discount</span>
            <span>Target</span>
            <span>Usage</span>
            <span>Expires</span>
            <span>Created</span>
            <span>Status</span>
          </div>

          {loading ? (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 56, background: "var(--surface)", borderRadius: 8 }} />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div style={{ padding: "64px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎟</div>
              <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No coupons yet</p>
            </div>
          ) : (
            coupons.map((coupon, i) => {
              const pct = usagePct(coupon.uses || 0, coupon.max_uses);
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
              return (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 100px 100px 1fr 120px 100px 80px",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                    opacity: !coupon.is_active ? 0.5 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <span style={{
                    fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)",
                    fontWeight: 700, letterSpacing: "0.08em",
                  }}>
                    {coupon.code}
                  </span>

                  <span style={{ fontSize: 13, color: "var(--accent3)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                    {coupon.discount_type === "percent"
                      ? `${coupon.discount_value}%`
                      : `$${coupon.discount_value}`}
                  </span>

                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                    {coupon.plan_target}
                  </span>

                  <div style={{ paddingRight: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                        {coupon.uses || 0}{coupon.max_uses ? ` / ${coupon.max_uses}` : " uses"}
                      </span>
                      {pct !== null && (
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    {pct !== null && (
                      <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          style={{
                            height: "100%", borderRadius: 2,
                            background: pct >= 90 ? "#f87171" : pct >= 60 ? "#facc15" : "var(--accent3)",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-dm-mono)",
                    color: isExpired ? "#f87171" : coupon.expires_at ? "var(--text-muted)" : "var(--text-subtle)",
                  }}>
                    {coupon.expires_at ? (isExpired ? "Expired" : timeAgo(coupon.expires_at)) : "Never"}
                  </span>

                  <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                    {timeAgo(coupon.created_at)}
                  </span>

                  <div>
                    {coupon.is_active && !isExpired ? (
                      <button
                        onClick={() => handleDeactivate(coupon.id)}
                        style={{
                          fontSize: 11, color: "#f87171",
                          background: "transparent", border: "none",
                          cursor: "pointer", fontFamily: "var(--font-dm-mono)",
                        }}
                      >
                        Disable
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                        {isExpired ? "expired" : "disabled"}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}