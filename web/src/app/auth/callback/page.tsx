"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { saveToken } from "@/lib/utils";
import { authAPI } from "@/lib/api";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const session = searchParams.get("session");

    if (session) {
      saveToken(session);

      // Fetch user data
      authAPI.getMe()
        .then(({ data }) => {
          localStorage.setItem("axon_user", JSON.stringify(data.user));
          router.push("/dashboard");
        })
        .catch(() => {
          router.push("/auth/login");
        });
    } else {
      router.push("/auth/login");
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: "center" }}
    >
      <div className="glass" style={{ borderRadius: 20, padding: 48, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 48, height: 48,
            border: "2px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            margin: "0 auto 24px",
          }}
        />

        <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-1px", marginBottom: 8 }}>
          Signing you in
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}>
          Please wait while we set up your account...
        </p>
      </div>
    </motion.div>
  );
}