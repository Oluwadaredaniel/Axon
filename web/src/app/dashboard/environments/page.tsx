"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { environmentAPI } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspaces, fetchAll } = useWorkspaceStore();
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [variables, setVariables] = useState([{ key: "", value: "" }]);
  const [creating, setCreating] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (workspaces.length > 0) load(workspaces[0].id); }, [workspaces]);

  const load = async (wsId?: string) => {
    setLoading(true);
    try {
      const res = await environmentAPI.getAll(wsId || workspaces[0]?.id || "");
      setEnvironments(res.data.environments || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const vars: Record<string, string> = {};
      variables.forEach(({ key, value }) => { if (key.trim()) vars[key] = value; });
      const res = await environmentAPI.create({ name, variables: vars });
      setEnvironments((prev) => [res.data.environment, ...prev]);
      setShowCreate(false);
      setName("");
      setVariables([{ key: "", value: "" }]);
    } catch {}
    setCreating(false);
  };

  const handleActivate = async (id: string) => {
    setActivating(id);
    try {
      await environmentAPI.setActive(id, "");
      setEnvironments((prev) => prev.map((e) => ({ ...e, is_active: e.id === id })));
    } catch {}
    setActivating(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await environmentAPI.delete(id);
      setEnvironments((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
  };

  const addVar = () => setVariables((prev) => [...prev, { key: "", value: "" }]);
  const updateVar = (i: number, field: "key" | "value", val: string) => {
    setVariables((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  };
  const removeVar = (i: number) => setVariables((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div style={{ flex: 1 }}>
      <Header title="Environments" />
      <div style={{ padding: 32 }}>

        {/* Top */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
        >
          <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 300 }}>
            Manage environment variables for different deployment contexts.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary" style={{ fontSize: 13 }}>
            + New environment
          </button>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 140, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : environments.length === 0 ? (
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>⊕</div>
            <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 8 }}>
              No environments yet
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, fontWeight: 300 }}>
              Create environments to manage your API base URLs and variables.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              Create environment
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {environments.map((env, i) => (
              <motion.div
                key={env.id}
                variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}
                whileHover={{ y: -2 }}
                className="glass"
                style={{
                  borderRadius: 14, padding: 20, cursor: "pointer",
                  borderColor: env.is_active ? "rgba(52,211,153,0.3)" : "var(--border)",
                  position: "relative", overflow: "hidden",
                }}
                onClick={() => setSelected(selected?.id === env.id ? null : env)}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: env.is_active ? "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)" : "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: env.is_active ? "var(--accent3)" : "var(--border-strong)",
                      boxShadow: env.is_active ? "0 0 8px var(--accent3)" : "none",
                    }} />
                    <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                      {env.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(env.id); }}
                    style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: 12 }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 16, fontFamily: "var(--font-dm-mono)" }}>
                  {Object.keys(env.variables || {}).length} variables · {timeAgo(env.created_at)}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleActivate(env.id); }}
                  disabled={env.is_active || activating === env.id}
                  className={env.is_active ? "btn btn-secondary" : "btn btn-primary"}
                  style={{ width: "100%", fontSize: 12, opacity: env.is_active ? 0.6 : 1 }}
                >
                  {activating === env.id ? "Activating..." : env.is_active ? "✓ Active" : "Set active"}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Selected env variables */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="glass"
              style={{ borderRadius: 16, padding: 24, marginTop: 24 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                  {selected.name} — Variables
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}
                >
                  ✕
                </button>
              </div>

              {Object.keys(selected.variables || {}).length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No variables defined.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(selected.variables || {}).map(([key, value]: any) => (
                    <div key={key} style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      gap: 12, padding: "10px 14px",
                      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                    }}>
                      <code style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-dm-mono)" }}>{key}</code>
                      <code style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>{value}</code>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create modal */}
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
              style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%", maxWidth: 520,
                borderRadius: 20, padding: 32,
                zIndex: 101, overflow: "hidden",
                maxHeight: "90vh", overflowY: "auto",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 24 }}>
                New environment
              </h3>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                  Name
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Production" className="input" autoFocus />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                    Variables
                  </label>
                  <button onClick={addVar} style={{ fontSize: 12, color: "var(--accent)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-mono)" }}>
                    + Add variable
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {variables.map((v, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 32px", gap: 8 }}>
                      <input
                        value={v.key}
                        onChange={(e) => updateVar(i, "key", e.target.value)}
                        placeholder="KEY"
                        className="input"
                        style={{ fontSize: 12 }}
                      />
                      <input
                        value={v.value}
                        onChange={(e) => updateVar(i, "value", e.target.value)}
                        placeholder="value"
                        className="input"
                        style={{ fontSize: 12 }}
                      />
                      <button
                        onClick={() => removeVar(i)}
                        style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-subtle)", cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating || !name.trim()} className="btn btn-primary" style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create environment"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}