"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth.store";
import { authAPI, apiKeyAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [keysLoaded, setKeysLoaded] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const loadKeys = async () => {
    if (keysLoaded) return;
    try {
      const res = await apiKeyAPI.list();
      setApiKeys(res.data.keys || []);
      setKeysLoaded(true);
    } catch {}
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return setError("Name is required");
    setSaving(true);
    setError("");
    try {
      const res = await authAPI.getMe();
      setUser({ ...user!, full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) return setPasswordMsg("Min. 8 characters");
    setChangingPassword(true);
    setPasswordMsg("");
    try {
      await authAPI.signIn({ email: user?.email || "", password: currentPassword });
      setPasswordMsg("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMsg("Current password is incorrect");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await apiKeyAPI.create(newKeyName);
      setNewKeyValue(res.data.key);
      setApiKeys((prev) => [res.data.apiKey, ...prev]);
      setNewKeyName("");
    } catch {}
    setCreatingKey(false);
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await apiKeyAPI.revoke(id);
      setApiKeys((prev) => prev.map((k) => k.id === id ? { ...k, revoked: true } : k));
    } catch {}
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Settings" />
      <div style={{ padding: 32, maxWidth: 640 }}>

        {/* Profile */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          className="glass"
          style={{ borderRadius: 16, padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
            Profile
          </h3>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, color: "white", fontWeight: 700,
            }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>{user?.full_name}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{user?.email}</div>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="input"
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: 13 }}
          >
            {saved ? "✓ Saved" : saving ? "Saving..." : "Save changes"}
          </button>
        </motion.div>

        {/* Password */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="glass"
          style={{ borderRadius: 16, padding: 24, marginBottom: 20, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 20 }}>
            Change password
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          {passwordMsg && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16,
              background: passwordMsg.includes("success") ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
              border: `1px solid ${passwordMsg.includes("success") ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
              color: passwordMsg.includes("success") ? "var(--accent3)" : "#f87171",
            }}>
              {passwordMsg}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            {changingPassword ? "Updating..." : "Update password"}
          </button>
        </motion.div>

        {/* API Keys */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="glass"
          style={{ borderRadius: 16, padding: 24, position: "relative", overflow: "hidden" }}
          onMouseEnter={loadKeys}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>
            API Keys
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, fontWeight: 300 }}>
            Use API keys to authenticate with the Axon API programmatically.
          </p>

          {/* Create key */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. CI/CD)"
              className="input"
              style={{ flex: 1 }}
            />
            <button
              onClick={handleCreateKey}
              disabled={creatingKey || !newKeyName.trim()}
              className="btn btn-primary"
              style={{ fontSize: 13, whiteSpace: "nowrap" }}
            >
              {creatingKey ? "..." : "Create key"}
            </button>
          </div>

          {/* New key reveal */}
          {newKeyValue && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "14px 16px", marginBottom: 16,
                background: "rgba(52,211,153,0.06)",
                border: "1px solid rgba(52,211,153,0.2)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--accent3)", marginBottom: 8, fontWeight: 600 }}>
                ✓ Key created — copy it now, it won&apos;t be shown again
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <code style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--font-dm-mono)", flex: 1, wordBreak: "break-all" }}>
                  {newKeyValue}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(newKeyValue); }}
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: "6px 12px", flexShrink: 0 }}
                >
                  Copy
                </button>
              </div>
            </motion.div>
          )}

          {/* Keys list */}
          {keysLoaded && apiKeys.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    opacity: key.revoked ? 0.5 : 1,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, marginBottom: 2 }}>
                      {key.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                      {key.key_prefix}•••• · Created {timeAgo(key.created_at)}
                    </div>
                  </div>
                  {key.revoked ? (
                    <span style={{ fontSize: 11, color: "#f87171", fontFamily: "var(--font-dm-mono)" }}>
                      Revoked
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="btn btn-danger"
                      style={{ fontSize: 11, padding: "5px 12px" }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}