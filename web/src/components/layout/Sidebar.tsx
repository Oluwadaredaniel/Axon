"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", icon: "⊞", href: "/dashboard" },
      { label: "Workspaces", icon: "◫", href: "/dashboard/workspaces" },
      { label: "History", icon: "◷", href: "/dashboard/history" },
      { label: "Collections", icon: "❏", href: "/dashboard/collections" },
    ],
  },
  {
    group: "Tools",
    items: [
      { label: "Environments", icon: "⊕", href: "/dashboard/environments" },
      { label: "Documentation", icon: "◈", href: "/dashboard/docs" },
      { label: "Teams", icon: "◎", href: "/dashboard/teams" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Billing", icon: "◇", href: "/dashboard/billing" },
      { label: "Settings", icon: "◉", href: "/dashboard/settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "rgba(4,4,12,0.95)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none",
        }}>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 12px var(--accent)",
            }}
          />
          <span style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800, fontSize: 18,
            color: "var(--text)", letterSpacing: "-0.5px",
          }}>
            Axon
          </span>
        </Link>
      </div>

      {/* Plan badge */}
      {user && (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "white", fontWeight: 700,
              }}>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600, lineHeight: 1.2 }}>
                  {user.full_name?.split(" ")[0]}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {user.plan} plan
                </div>
              </div>
            </div>
            {user.plan === "free" && (
              <Link href="/dashboard/billing" style={{
                fontSize: 10, color: "var(--accent)",
                textDecoration: "none", fontFamily: "var(--font-dm-mono)",
                padding: "3px 8px", background: "var(--glow)",
                border: "1px solid var(--accent)", borderRadius: 4,
              }}>
                Upgrade
              </Link>
            )}
          </div>
        </div>
      )}

      {/* AI Usage */}
      {user && (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
              AI requests
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
              {user.ai_requests_used}/{user.plan === "free" ? user.ai_requests_limit : "∞"}
            </span>
          </div>
          {user.plan === "free" && (
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((user.ai_requests_used / user.ai_requests_limit) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 2,
                  background: user.ai_requests_used / user.ai_requests_limit > 0.8
                    ? "#f87171" : "var(--accent)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {navItems.map((group) => (
          <div key={group.group} style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, color: "var(--text-subtle)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "0 8px", marginBottom: 6,
              fontFamily: "var(--font-dm-mono)",
            }}>
              {group.group}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none", display: "block", marginBottom: 2 }}
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 10px", borderRadius: 8,
                    background: isActive(item.href)
                      ? "rgba(79,138,255,0.08)" : "transparent",
                    border: isActive(item.href)
                      ? "1px solid rgba(79,138,255,0.15)" : "1px solid transparent",
                    color: isActive(item.href) ? "var(--accent)" : "var(--text-muted)",
                    fontSize: 13, fontFamily: "var(--font-dm-mono)",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeIndicator"
                      style={{
                        marginLeft: "auto", width: 4, height: 4,
                        borderRadius: "50%", background: "var(--accent)",
                        boxShadow: "0 0 6px var(--accent)",
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        ))}

        {/* Admin link */}
        {user?.is_admin && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10, color: "var(--text-subtle)",
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "0 8px", marginBottom: 6,
              fontFamily: "var(--font-dm-mono)",
            }}>
              Admin
            </div>
            <Link href="/admin" style={{ textDecoration: "none", display: "block" }}>
              <motion.div
                whileHover={{ x: 2 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8,
                  background: pathname.startsWith("/admin")
                    ? "rgba(167,139,250,0.08)" : "transparent",
                  border: pathname.startsWith("/admin")
                    ? "1px solid rgba(167,139,250,0.15)" : "1px solid transparent",
                  color: pathname.startsWith("/admin") ? "var(--accent2)" : "var(--text-muted)",
                  fontSize: 13, fontFamily: "var(--font-dm-mono)",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14 }}>⬡</span>
                Admin Panel
              </motion.div>
            </Link>
          </div>
        )}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "12px 12px 24px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "flex-start", gap: 10, fontSize: 13 }}
        >
          <span>⎋</span>
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </motion.aside>
  );
}