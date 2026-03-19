"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { teamAPI } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const ROLES = ["member", "admin"];

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  owner: { color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  admin: { color: "var(--accent2)", bg: "rgba(167,139,250,0.1)" },
  member: { color: "var(--text-muted)", bg: "var(--surface)" },
};

export default function TeamsPage() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teamAPI.getAll();
      setTeams(res.data.teams || []);
      if (res.data.teams?.length > 0 && !selected) {
        loadTeam(res.data.teams[0].id);
      }
    } catch {}
    setLoading(false);
  };

  const loadTeam = async (id: string) => {
    try {
      const res = await teamAPI.getOne(id);
      setSelected(res.data.team);
    } catch {}
  };

  const handleCreate = async () => {
    if (!teamName.trim()) return;
    setCreating(true);
    try {
      const res = await teamAPI.create({ name: teamName });
      setTeams((prev) => [res.data.team, ...prev]);
      setSelected(res.data.team);
      setShowCreate(false);
      setTeamName("");
    } catch {}
    setCreating(false);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selected) return;
    setInviting(true);
    setInviteMsg("");
    try {
      await teamAPI.inviteMember(selected.id, { email: inviteEmail, role: inviteRole });
      setInviteMsg("Invitation sent successfully");
      setInviteEmail("");
      setTimeout(() => { setShowInvite(false); setInviteMsg(""); }, 1500);
    } catch (err: any) {
      setInviteMsg(err.response?.data?.error || "Failed to send invite");
    }
    setInviting(false);
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    if (!selected) return;
    try {
      await teamAPI.updateMemberRole(selected.id, memberId, role);
      setSelected((prev: any) => ({
        ...prev,
        members: prev.members.map((m: any) =>
          m.id === memberId ? { ...m, role } : m
        ),
      }));
    } catch {}
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selected) return;
    try {
      await teamAPI.removeMember(selected.id, memberId);
      setSelected((prev: any) => ({
        ...prev,
        members: prev.members.filter((m: any) => m.id !== memberId),
      }));
    } catch {}
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    try {
      await teamAPI.delete(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
  };

  const isOwner = selected?.members?.find(
    (m: any) => m.user_id === user?.id
  )?.role === "owner";

  return (
    <div style={{ flex: 1 }}>
      <Header title="Teams" />
      <div style={{ display: "flex", height: "calc(100vh - var(--header-height))" }}>

        {/* Left panel */}
        <div style={{ width: 280, borderRight: "1px solid var(--border)", overflowY: "auto", padding: 16, flexShrink: 0 }}>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: 16, fontSize: 13 }}
          >
            + New team
          </button>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2].map((i) => (
                <div key={i} style={{ height: 64, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }} />
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.8 }}>
                No teams yet. Create a team to collaborate with others.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => loadTeam(team.id)}
                  style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: selected?.id === team.id ? "rgba(79,138,255,0.08)" : "var(--surface)",
                    border: `1px solid ${selected?.id === team.id ? "rgba(79,138,255,0.2)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                      {team.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                      style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                    {team.member_count || 0} members · {timeAgo(team.created_at)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          {!selected ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>◎</div>
              <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>
                Select a team to manage members
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selected.id}>

              {/* Team header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 24, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 4 }}>
                    {selected.name}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {selected.members?.length || 0} members · Created {timeAgo(selected.created_at)}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="btn btn-primary"
                    style={{ fontSize: 13 }}
                  >
                    + Invite member
                  </button>
                )}
              </div>

              {/* Members */}
              <div className="glass" style={{ borderRadius: 16, overflow: "hidden" }}>
                {/* Header row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 120px 80px",
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 11, color: "var(--text-subtle)",
                  fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  <span>Member</span>
                  <span>Role</span>
                  <span>Joined</span>
                  <span>Actions</span>
                </div>

                {(selected.members || []).map((member: any, i: number) => {
                  const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.member;
                  const isMe = member.user_id === user?.id;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        display: "grid", gridTemplateColumns: "1fr 120px 120px 80px",
                        padding: "16px 20px",
                        borderBottom: "1px solid var(--border)",
                        alignItems: "center",
                      }}
                    >
                      {/* Member info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, color: "white", fontWeight: 700, flexShrink: 0,
                        }}>
                          {member.profiles?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                            {member.profiles?.full_name || "Unknown"}
                            {isMe && <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 8, fontFamily: "var(--font-dm-mono)" }}>you</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                            {member.profiles?.email}
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div>
                        {isOwner && member.role !== "owner" ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            style={{
                              padding: "4px 10px", borderRadius: 6,
                              background: roleStyle.bg,
                              border: `1px solid ${roleStyle.color}30`,
                              color: roleStyle.color,
                              fontFamily: "var(--font-dm-mono)", fontSize: 11,
                              cursor: "pointer", outline: "none",
                            }}
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            fontSize: 11, padding: "3px 10px",
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.color}30`,
                            borderRadius: 6,
                            fontFamily: "var(--font-dm-mono)",
                          }}>
                            {member.role}
                          </span>
                        )}
                      </div>

                      {/* Joined */}
                      <span style={{ fontSize: 12, color: "var(--text-subtle)" }}>
                        {timeAgo(member.created_at)}
                      </span>

                      {/* Actions */}
                      <div>
                        {isOwner && member.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="btn btn-danger"
                            style={{ fontSize: 11, padding: "4px 10px" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Create team modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
              className="glass"
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 420, borderRadius: 20, padding: 32, zIndex: 101, overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 24 }}>
                Create team
              </h3>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                  Team name
                </label>
                <input
                  type="text" value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Acme Engineering"
                  className="input" autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating || !teamName.trim()} className="btn btn-primary" style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create team"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowInvite(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 100 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
              className="glass"
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 440, borderRadius: 20, padding: 32, zIndex: 101, overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 24 }}>
                Invite member
              </h3>

              {inviteMsg && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16,
                  background: inviteMsg.includes("success") ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                  border: `1px solid ${inviteMsg.includes("success") ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                  color: inviteMsg.includes("success") ? "var(--accent3)" : "#f87171",
                }}>
                  {inviteMsg}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                    Email address
                  </label>
                  <input
                    type="email" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="input" autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                    Role
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setInviteRole(r)}
                        style={{
                          flex: 1, padding: "9px 16px",
                          background: inviteRole === r ? "var(--glow)" : "var(--surface)",
                          border: `1px solid ${inviteRole === r ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: 8, cursor: "pointer",
                          color: inviteRole === r ? "var(--accent)" : "var(--text-muted)",
                          fontFamily: "var(--font-dm-mono)", fontSize: 13,
                          transition: "all 0.2s",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowInvite(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="btn btn-primary" style={{ flex: 1 }}>
                  {inviting ? "Sending..." : "Send invite"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}