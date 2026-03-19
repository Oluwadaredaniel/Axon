"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const adminNav = [
  { label: "Overview", icon: "⊞", href: "/admin" },
  { label: "Users", icon: "◎", href: "/admin/users" },
  { label: "Plans", icon: "◇", href: "/admin/plans" },
  { label: "Revenue", icon: "◈", href: "/admin/revenue" },
  { label: "Waitlist", icon: "◷", href: "/admin/waitlist" },
  { label: "Extension", icon: "⬡", href: "/admin/extension" },
  { label: "Error Logs", icon: "⊘", href: "/admin/logs" },
  { label: "Announcements", icon: "◉", href: "/admin/announcements" },
  { label: "Health", icon: "⊕", href: "/admin/health" },
  { label: "Coupons", icon: "◆", href: "/admin/coupons" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized]);

  useEffect(() => {
    if (initialized && (!user || !user.is_admin)) {
      router.push("/dashboard");
    }
  }, [initialized, user]);

  if (!initialized || !user?.is_admin) return null;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: "var(--sidebar-width)",
          height: "100vh",
          position: "fixed",
          top: 0, left: 0,
          background: "rgba(4,4,12,0.95)",
          borderRight: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent2)",
              boxShadow: "0 0 12px var(--accent2)",
            }} />
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 18, color: "var(--text)" }}>
              Axon <span style={{ color: "var(--accent2)", fontSize: 12 }}>Admin</span>
            </span>
          </Link>
        </div>

        {/* Back to dashboard */}
        <div style={{ padding: "12px 12px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: 8,
              color: "var(--text-muted)", fontSize: 12,
              fontFamily: "var(--font-dm-mono)",
              transition: "color 0.15s",
            }}>
              ← Back to dashboard
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", display: "block", marginBottom: 2 }}>
              <motion.div
                whileHover={{ x: 2 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8,
                  background: isActive(item.href) ? "rgba(167,139,250,0.08)" : "transparent",
                  border: isActive(item.href) ? "1px solid rgba(167,139,250,0.15)" : "1px solid transparent",
                  color: isActive(item.href) ? "var(--accent2)" : "var(--text-muted)",
                  fontSize: 13, fontFamily: "var(--font-dm-mono)",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent2), var(--accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "white", fontWeight: 700,
            }}>
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{user.full_name?.split(" ")[0]}</div>
              <div style={{ fontSize: 10, color: "var(--accent2)", fontFamily: "var(--font-dm-mono)" }}>admin</div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: "var(--sidebar-width)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}