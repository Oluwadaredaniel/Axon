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

const AUDIENCES = [
  { value: "all", label: "All Users" },
  { value: "free", label: "Free Plan" },
  { value: "pro", label: "Pro Plan" },
  { value: "team", label: "Team Plan" },
];

const TYPES = [
  { value: "in_app", label: "In-app only" },
  { value: "email", label: "Email only" },
  { value: "both", label: "In-app + Email" },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [type, setType] = useState("both");
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch {}
    setLoading(false);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    try {
      await adminAPI.sendAnnouncement({
        title,
        message,
        audience,
        type,
        scheduled_at: scheduledAt || null,
      });
      setSent(true);
      setTitle("");
      setMessage("");
      setAudience("all");
      setType("both");
      setScheduledAt("");
      await load();
      setTimeout(() => setSent(false), 3000);
    } catch {}
    setSending(false);
  };

  const typeColor = (t: string) => {
    if (t === "email") return "var(--accent2)";
    if (t === "in_app") return "var(--accent)";
    return "var(--accent3)";
  };

  const audienceColor = (a: string) => {
    if (a === "pro") return "var(--accent)";
    if (a === "team") return "var(--accent2)";
    if (a === "free") return "var(--text-muted)";
    return "var(--accent3)";
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
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            Announcements
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
            Send in-app notifications and email blasts to users
          </p>
        </div>
      </div>

      <div style={{ padding: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Compose */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="glass"
            style={{ borderRadius: 16, padding: 28 }}
          >
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 24 }}>
              New Announcement
            </h3>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New feature: Environment switching"
                className="input"
                style={{ width: "100%" }}
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement message..."
                rows={5}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8, color: "var(--text)",
                  fontFamily: "var(--font-dm-mono)", fontSize: 13,
                  resize: "vertical", outline: "none",
                  lineHeight: 1.7,
                }}
              />
            </div>

            {/* Audience */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Audience
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAudience(a.value)}
                    style={{
                      flex: 1, padding: "8px 4px",
                      background: audience === a.value ? "var(--glow)" : "var(--surface)",
                      border: `1px solid ${audience === a.value ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 6,
                      color: audience === a.value ? "var(--accent)" : "var(--text-muted)",
                      fontFamily: "var(--font-dm-mono)", fontSize: 11, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Delivery
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    style={{
                      flex: 1, padding: "8px 4px",
                      background: type === t.value ? "var(--glow)" : "var(--surface)",
                      border: `1px solid ${type === t.value ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: 6,
                      color: type === t.value ? "var(--accent)" : "var(--text-muted)",
                      fontFamily: "var(--font-dm-mono)", fontSize: 11, cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Schedule (optional — leave blank to send now)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="input"
                style={{ width: "100%" }}
              />
            </div>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
              className="btn btn-primary"
              style={{ width: "100%", fontSize: 14, padding: "12px 0", position: "relative" }}
            >
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.span
                    key="sent"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    style={{ color: "var(--accent3)" }}
                  >
                    ✓ Sent successfully
                  </motion.span>
                ) : sending ? (
                  <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    Sending...
                  </motion.span>
                ) : (
                  <motion.span key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {scheduledAt ? "Schedule announcement" : "Send now"}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          {/* History */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="glass"
            style={{ borderRadius: 16, padding: 28 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                Sent History
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                {announcements.length} total
              </span>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ height: 80, background: "var(--surface)", borderRadius: 10 }} />
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📣</div>
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No announcements sent yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", maxHeight: "calc(100vh - 300px)" }}>
                {announcements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      padding: "14px 16px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, flex: 1, paddingRight: 8 }}>
                        {a.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 4,
                          background: `${audienceColor(a.audience)}15`,
                          color: audienceColor(a.audience),
                          border: `1px solid ${audienceColor(a.audience)}30`,
                          fontFamily: "var(--font-dm-mono)",
                        }}>
                          {a.audience}
                        </span>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 4,
                          background: `${typeColor(a.type)}15`,
                          color: typeColor(a.type),
                          border: `1px solid ${typeColor(a.type)}30`,
                          fontFamily: "var(--font-dm-mono)",
                        }}>
                          {a.type}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 8, fontWeight: 300 }}>
                      {a.message.length > 100 ? `${a.message.slice(0, 100)}...` : a.message}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                        {timeAgo(a.created_at)}
                      </span>
                      {a.scheduled_at && new Date(a.scheduled_at) > new Date() && (
                        <span style={{ fontSize: 10, color: "#facc15", fontFamily: "var(--font-dm-mono)", background: "rgba(250,204,21,0.1)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(250,204,21,0.2)" }}>
                          scheduled
                        </span>
                      )}
                      {a.sent_count !== undefined && (
                        <span style={{ fontSize: 11, color: "var(--accent3)", fontFamily: "var(--font-dm-mono)" }}>
                          {a.sent_count} recipients
                        </span>
                      )}
                    </div>
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