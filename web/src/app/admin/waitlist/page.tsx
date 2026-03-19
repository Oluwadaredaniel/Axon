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

export default function AdminWaitlistPage() {
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getWaitlist();
      setWaitlist(res.data.waitlist || []);
    } catch {}
    setLoading(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 1500);
  };

  const exportCSV = () => {
    const csv = ["email,name,source,joined\n",
      ...filtered.map((w) => `${w.email},${w.name || ""},${w.source || ""},${w.created_at}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "axon-waitlist.csv";
    a.click();
  };

  const filtered = waitlist.filter((w) =>
    !search ||
    w.email?.toLowerCase().includes(search.toLowerCase()) ||
    w.name?.toLowerCase().includes(search.toLowerCase())
  );

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
          Waitlist
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
            {filtered.length} signups
          </span>
          <button onClick={exportCSV} className="btn btn-secondary" style={{ fontSize: 12, padding: "8px 16px" }}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ padding: 32 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Signups", value: waitlist.length, color: "var(--accent)" },
            { label: "This Week", value: waitlist.filter((w) => new Date(w.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, color: "var(--accent3)" },
            { label: "With Name", value: waitlist.filter((w) => w.name).length, color: "var(--accent2)" },
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

        {/* Search */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="input"
            style={{ maxWidth: 400 }}
          />
        </motion.div>

        {/* Table */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
          className="glass"
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 120px 100px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--border)",
            fontSize: 11, color: "var(--text-subtle)",
            fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            <span>Email</span>
            <span>Name</span>
            <span>Source</span>
            <span>Joined</span>
          </div>

          {loading ? (
            <div style={{ padding: 24 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 6, marginBottom: 6 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No waitlist entries found</p>
            </div>
          ) : (
            filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 120px 100px",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 13, color: "var(--text)",
                    fontFamily: "var(--font-dm-mono)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {entry.email}
                  </span>
                  <button
                    onClick={() => copyEmail(entry.email)}
                    style={{
                      fontSize: 10, color: copied === entry.email ? "var(--accent3)" : "var(--text-subtle)",
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "var(--font-dm-mono)", flexShrink: 0,
                      transition: "color 0.2s",
                    }}
                  >
                    {copied === entry.email ? "✓ copied" : "copy"}
                  </button>
                </div>

                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {entry.name || <span style={{ color: "var(--text-subtle)" }}>—</span>}
                </span>

                <span style={{
                  fontSize: 11, color: "var(--accent)",
                  fontFamily: "var(--font-dm-mono)",
                }}>
                  {entry.source || "landing"}
                </span>

                <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
                  {timeAgo(entry.created_at)}
                </span>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
} 