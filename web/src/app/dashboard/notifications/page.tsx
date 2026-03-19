"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { notificationAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const TYPE_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  info: { color: "var(--accent)", bg: "rgba(79,138,255,0.08)", icon: "◎" },
  warning: { color: "#facc15", bg: "rgba(250,204,21,0.08)", icon: "⚠" },
  error: { color: "#f87171", bg: "rgba(248,113,113,0.08)", icon: "✕" },
  success: { color: "var(--accent3)", bg: "rgba(52,211,153,0.08)", icon: "✓" },
  upgrade: { color: "var(--accent2)", bg: "rgba(167,139,250,0.08)", icon: "◇" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
    } catch {}
    setLoading(false);
  };

  const markRead = async (id: string) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, read: true } : n)
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ flex: 1 }}>
      <Header title="Notifications" />
      <div style={{ padding: 32, maxWidth: 720 }}>

        {/* Top bar */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px", borderRadius: 6,
                  background: filter === f ? "var(--glow)" : "var(--surface)",
                  border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
                  color: filter === f ? "var(--accent)" : "var(--text-muted)",
                  fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f}{f === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                fontSize: 12, color: "var(--accent)", background: "transparent",
                border: "none", cursor: "pointer", fontFamily: "var(--font-dm-mono)",
              }}
            >
              Mark all read
            </button>
          )}
        </motion.div>

        {/* List */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 72, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ textAlign: "center", padding: "64px 0" }}
          >
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>◎</div>
            <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {filtered.map((notif, i) => {
                const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
                return (
                  <motion.div
                    key={notif.id}
                    variants={fadeUp} initial="hidden" animate="visible" custom={i}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => !notif.read && markRead(notif.id)}
                    className="glass"
                    style={{
                      borderRadius: 12, padding: "16px 20px",
                      display: "flex", gap: 16, alignItems: "flex-start",
                      cursor: !notif.read ? "pointer" : "default",
                      borderColor: !notif.read ? "var(--border-strong)" : "var(--border)",
                      opacity: notif.read ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: style.bg,
                      border: `1px solid ${style.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: style.color, flexShrink: 0,
                    }}>
                      {style.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", flexShrink: 0, marginLeft: 12 }}>
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontWeight: 300 }}>
                        {notif.message}
                      </p>
                      {notif.action_url && (
                        <a
                          href={notif.action_url}
                          style={{ fontSize: 12, color: style.color, textDecoration: "none", marginTop: 8, display: "inline-block" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notif.action_label || "View"} →
                        </a>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: style.color,
                        boxShadow: `0 0 8px ${style.color}`,
                        flexShrink: 0, marginTop: 4,
                      }} />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}