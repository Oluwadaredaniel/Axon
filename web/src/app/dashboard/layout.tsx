"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) initialize();
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !user) {
      router.push("/auth/login");
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 12px var(--accent)",
            margin: "0 auto 16px",
            animation: "pulse-glow 2s ease infinite",
          }} />
          <p style={{ fontSize: 13, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {children}
      </main>
    </div>
  );
}