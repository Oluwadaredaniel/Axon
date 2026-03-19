"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useWorkspaces } from "@/hooks/useWorkspace";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const FRAMEWORKS = ["express", "nestjs"];

export default function WorkspacesPage() {
  const { workspaces, loading } = useWorkspaces();
  const { create, delete: deleteWorkspace } = useWorkspaceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [framework, setFramework] = useState("express");
  const [githubRepo, setGithubRepo] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return setError("Workspace name is required");
    setError("");
    setCreating(true);
    try {
      const ws = await create({ name, framework, github_repo: githubRepo });
      setShowCreate(false);
      setName("");
      setGithubRepo("");
      router.push(`/dashboard/workspaces/${ws.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkspace(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Workspaces" />
      <div style={{ padding: 32 }}>

        {/* Top bar */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}
        >
          <div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}>
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
          >
            + New workspace
          </button>
        </motion.div>

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreate(false)}
                style={{
                  position: "fixed", inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(4px)",
                  zIndex: 100,
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
                className="glass"
                style={{
                  position: "fixed",
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100%", maxWidth: 480,
                  borderRadius: 20, padding: 32,
                  zIndex: 101,
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 6 }}>
                  New workspace
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, fontWeight: 300 }}>
                  A workspace represents one of your projects.
                </p>

                {error && (
                  <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171", marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                      Workspace name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My API project"
                      className="input"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                      Framework
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {FRAMEWORKS.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFramework(f)}
                          style={{
                            flex: 1, padding: "10px 16px",
                            background: framework === f ? "var(--glow)" : "var(--surface)",
                            border: `1px solid ${framework === f ? "var(--accent)" : "var(--border)"}`,
                            borderRadius: 8, cursor: "pointer",
                            color: framework === f ? "var(--accent)" : "var(--text-muted)",
                            fontFamily: "var(--font-dm-mono)", fontSize: 13,
                            transition: "all 0.2s",
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                      GitHub repo <span style={{ color: "var(--text-subtle)" }}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="username/repo"
                      className="input"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button onClick={handleCreate} disabled={creating} className="btn btn-primary" style={{ flex: 1 }}>
                    {creating ? "Creating..." : "Create workspace"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Workspaces grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 160, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>◫</div>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>
              No workspaces yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, fontWeight: 300 }}>
              Create your first workspace to start scanning and testing APIs.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              Create workspace
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {workspaces.map((ws, i) => (
              <motion.div
                key={ws.id}
                variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                whileHover={{ y: -4 }}
                className="glass"
                style={{ borderRadius: 16, padding: 24, cursor: "pointer", position: "relative", overflow: "hidden" }}
                onClick={() => router.push(`/dashboard/workspaces/${ws.id}`)}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "var(--glow)", border: "1px solid var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>
                    ◫
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ws.id); }}
                    disabled={deletingId === ws.id}
                    style={{
                      width: 28, height: 28,
                      background: "transparent", border: "none",
                      color: "var(--text-subtle)", cursor: "pointer",
                      fontSize: 14, borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {deletingId === ws.id ? "..." : "✕"}
                  </button>
                </div>

                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>
                  {ws.name}
                </h3>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {ws.framework && (
                    <span style={{
                      fontSize: 10, color: "var(--accent)", background: "var(--glow)",
                      border: "1px solid var(--accent)", padding: "2px 8px",
                      borderRadius: 4, fontFamily: "var(--font-dm-mono)",
                    }}>
                      {ws.framework}
                    </span>
                  )}
                  {ws.github_repo && (
                    <span style={{
                      fontSize: 10, color: "var(--text-subtle)", background: "var(--surface)",
                      border: "1px solid var(--border)", padding: "2px 8px",
                      borderRadius: 4, fontFamily: "var(--font-dm-mono)",
                    }}>
                      ⌥ {ws.github_repo}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                    {timeAgo(ws.created_at)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-dm-mono)" }}>
                    Open →
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Create new card */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="visible" custom={workspaces.length + 1}
              whileHover={{ y: -4, borderColor: "var(--border-strong)" }}
              onClick={() => setShowCreate(true)}
              style={{
                borderRadius: 16, padding: 24,
                border: "1px dashed var(--border)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", minHeight: 160,
                color: "var(--text-subtle)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>+</div>
              <span style={{ fontSize: 13, fontFamily: "var(--font-dm-mono)" }}>
                New workspace
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}