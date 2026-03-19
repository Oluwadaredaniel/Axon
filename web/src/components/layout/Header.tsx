"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { notificationAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title?: string }) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState(0);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      notificationAPI.getUnreadCount()
        .then(({ data }) => setNotifications(data.count))
        .catch(() => {});
    }
  }, [user]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(search)}`);
      setSearch("");
      setShowSearch(false);
    }
    if (e.key === "Escape") {
      setShowSearch(false);
      setSearch("");
    }
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        height: "var(--header-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(2,2,10,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Title */}
      <div>
        {title && (
          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: 18,
            color: "var(--text)",
            letterSpacing: "-0.5px",
          }}>
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

        {/* Search */}
        <AnimatePresence>
          {showSearch ? (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              onBlur={() => { setShowSearch(false); setSearch(""); }}
              placeholder="Search routes, history..."
              style={{
                height: 36,
                padding: "0 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                borderRadius: 8,
                color: "var(--text)",
                fontFamily: "var(--font-dm-mono)",
                fontSize: 13,
                outline: "none",
              }}
            />
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(true)}
              style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8, cursor: "pointer",
                color: "var(--text-muted)", fontSize: 14,
              }}
            >
              ⌕
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <Link href="/dashboard/notifications" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8, cursor: "pointer",
              color: "var(--text-muted)", fontSize: 14,
              position: "relative",
            }}
          >
            ◎
            {notifications > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  top: -4, right: -4,
                  width: 16, height: 16,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "white", fontWeight: 700,
                }}
              >
                {notifications > 9 ? "9+" : notifications}
              </motion.div>
            )}
          </motion.div>
        </Link>

        {/* Avatar */}
        <Link href="/dashboard/settings" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 36, height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "white", fontWeight: 700,
              cursor: "pointer", border: "1px solid var(--border)",
            }}
          >
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </motion.div>
        </Link>
      </div>
    </motion.header>
  );
} 