"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { collectionAPI } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getMethodColor, getMethodBg, timeAgo } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspaces, fetchAll } = useWorkspaceStore();
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (workspaces.length > 0) load(workspaces[0].id); }, [workspaces]);

  const load = async (wsId?: string) => {
    setLoading(true);
    try {
      const res = await collectionAPI.getAll(wsId || workspaces[0]?.id || "");
      setCollections(res.data.collections || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await collectionAPI.create({ name, description });
      setCollections((prev) => [res.data.collection, ...prev]);
      setShowCreate(false);
      setName("");
      setDescription("");
    } catch {}
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await collectionAPI.delete(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Collections" />
      <div style={{ display: "flex", height: "calc(100vh - var(--header-height))" }}>

        {/* Left panel */}
        <div style={{ width: 300, borderRight: "1px solid var(--border)", overflowY: "auto", padding: 16, flexShrink: 0 }}>
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: 16, fontSize: 13 }}
          >
            + New collection
          </button>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: 72, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }} />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.8 }}>
                No collections yet. Group your API routes into collections for easy access.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {collections.map((col, i) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(col)}
                  style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: selected?.id === col.id ? "rgba(79,138,255,0.08)" : "var(--surface)",
                    border: `1px solid ${selected?.id === col.id ? "rgba(79,138,255,0.2)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                      {col.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }}
                      style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: 12 }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", display: "flex", gap: 10 }}>
                    <span>{col.routes?.length || 0} routes</span>
                    <span>{timeAgo(col.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selected ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>❏</div>
              <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>
                Select a collection to view its routes
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selected.id}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 6 }}>
                  {selected.name}
                </h2>
                {selected.description && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 300 }}>
                    {selected.description}
                  </p>
                )}
              </div>

              {(!selected.routes || selected.routes.length === 0) ? (
                <div className="glass" style={{ borderRadius: 14, padding: 40, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "var(--text-subtle)", lineHeight: 1.8 }}>
                    No routes in this collection yet.<br />
                    Add routes from your workspaces.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.routes.map((route: any, i: number) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass"
                      style={{ borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        color: getMethodColor(route.method),
                        background: getMethodBg(route.method),
                        padding: "2px 8px", borderRadius: 4,
                        fontFamily: "var(--font-dm-mono)", minWidth: 48, textAlign: "center",
                      }}>
                        {route.method}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", flex: 1 }}>
                        {route.path}
                      </span>
                      <button
                        onClick={() => collectionAPI.removeRoute(selected.id, route.id).then(() => load())}
                        style={{ background: "transparent", border: "none", color: "var(--text-subtle)", cursor: "pointer", fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
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
              style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", maxWidth: 440, borderRadius: 20, padding: 32, zIndex: 101, overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <h3 style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 24 }}>
                New collection
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                    Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Auth routes" className="input" autoFocus />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-dm-mono)" }}>
                    Description <span style={{ color: "var(--text-subtle)" }}>(optional)</span>
                  </label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="All authentication related routes" className="input" />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleCreate} disabled={creating || !name.trim()} className="btn btn-primary" style={{ flex: 1 }}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}