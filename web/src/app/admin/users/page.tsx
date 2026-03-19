"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const PLANS = ["all", "free", "pro", "team"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [banning, setBanning] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users || []);
    } catch {}
    setLoading(false);
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    setUpdatingPlan(true);
    try {
      await adminAPI.updateUserPlan(userId, plan);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan } : u));
      if (selected?.id === userId) setSelected((prev: any) => ({ ...prev, plan }));
    } catch {}
    setUpdatingPlan(false);
  };

  const handleBan = async (userId: string) => {
    if (!confirm("Ban this user? They will lose access immediately.")) return;
    setBanning(true);
    try {
      await adminAPI.banUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelected(null);
    } catch {}
    setBanning(false);
  };

  const filtered = users.filter((u) => {
    const matchesPlan = planFilter === "all" || u.plan === planFilter;
    const matchesSearch = !search || 
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesPlan && matchesSearch;
  });

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
        <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
          Users
        </h1>
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
          {filtered.length} users
        </span>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - var(--header-height))" }}>
        {/* Users list */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>

          {/* Controls */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            style={{ display: "flex", gap: 12, marginBottom: 20 }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="input"
              style={{ flex: 1 }}
            />
            <div style={{ display: "flex", gap: 4 }}>
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  style={{
                    padding: "8px 14px", borderRadius: 6,
                    background: planFilter === p ? "var(--glow)" : "var(--surface)",
                    border: `1px solid ${planFilter === p ? "var(--accent)" : "var(--border)"}`,
                    color: planFilter === p ? "var(--accent)" : "var(--text-muted)",
                    fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="glass"
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 100px 100px 60px",
              padding: "12px 20px",
              borderBottom: "1px solid var(--border)",
              fontSize: 11, color: "var(--text-subtle)",
              fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span>User</span>
              <span>Plan</span>
              <span>AI Used</span>
              <span>Joined</span>
              <span>Action</span>
            </div>

            {loading ? (
              <div style={{ padding: 24 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 6, marginBottom: 6 }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No users found</p>
              </div>
            ) : (
              filtered.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelected(selected?.id === user.id ? null : user)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 100px 100px 60px",
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                    cursor: "pointer",
                    background: selected?.id === user.id ? "rgba(167,139,250,0.04)" : "transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "white", fontWeight: 700, flexShrink: 0,
                    }}>
                      {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                        {user.full_name}
                        {user.is_admin && (
                          <span style={{ fontSize: 9, color: "var(--accent2)", marginLeft: 6, fontFamily: "var(--font-dm-mono)", background: "rgba(167,139,250,0.1)", padding: "1px 6px", borderRadius: 3 }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{user.email}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    display: "inline-block",
                    background: user.plan === "pro" ? "var(--glow)" : user.plan === "team" ? "rgba(167,139,250,0.1)" : "var(--surface)",
                    color: user.plan === "pro" ? "var(--accent)" : user.plan === "team" ? "var(--accent2)" : "var(--text-subtle)",
                    border: `1px solid ${user.plan === "pro" ? "var(--accent)" : user.plan === "team" ? "var(--accent2)" : "var(--border)"}`,
                    fontFamily: "var(--font-dm-mono)",
                  }}>
                    {user.plan}
                  </span>

                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                    {user.ai_requests_used || 0}
                  </span>

                  <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
                    {timeAgo(user.created_at)}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(user); }}
                    style={{ fontSize: 11, color: "var(--accent2)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-mono)" }}
                  >
                    Edit
                  </button>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* User detail panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: 300, borderLeft: "1px solid var(--border)",
              overflowY: "auto", padding: 24, flexShrink: 0,
            }}
          >
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "white", fontWeight: 700,
                margin: "0 auto 12px",
              }}>
                {selected.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 700, marginBottom: 4 }}>
                {selected.full_name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.email}</div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Plan", value: selected.plan },
                { label: "AI Requests", value: `${selected.ai_requests_used || 0} used` },
                { label: "Joined", value: timeAgo(selected.created_at) },
                { label: "Admin", value: selected.is_admin ? "Yes" : "No" },
              ].map((s) => (
                <div key={s.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Change plan */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Change plan
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {["free", "pro", "team"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleUpdatePlan(selected.id, p)}
                    disabled={updatingPlan || selected.plan === p}
                    style={{
                      flex: 1, padding: "8px 4px",
                      background: selected.plan === p ? "var(--glow)" : "var(--surface)",
                      border: `1px solid ${selected.plan === p ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 6,
                      color: selected.plan === p ? "var(--accent)" : "var(--text-muted)",
                      fontFamily: "var(--font-dm-mono)", fontSize: 11, cursor: "pointer",
                      opacity: updatingPlan ? 0.5 : 1,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Ban */}
            {!selected.is_admin && (
              <button
                onClick={() => handleBan(selected.id)}
                disabled={banning}
                className="btn btn-danger"
                style={{ width: "100%", fontSize: 13 }}
              >
                {banning ? "Banning..." : "Ban user"}
              </button>
            )}

            <button
              onClick={() => setSelected(null)}
              className="btn btn-ghost"
              style={{ width: "100%", fontSize: 13, marginTop: 8 }}
            >
              Close
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}