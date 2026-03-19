"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace.store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const METHOD_COLORS: Record<string, string> = {
  GET: "var(--accent3)",
  POST: "var(--accent)",
  PUT: "#facc15",
  PATCH: "var(--accent2)",
  DELETE: "#f87171",
};

export default function DocsPage() {
  const { workspaces } = useWorkspaceStore();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Load docs for all workspaces
      const results = await Promise.all(
        (workspaces || []).map((w: any) =>
          api.get(`/docs/${w.id}`).then((r) => r.data.docs || []).catch(() => [])
        )
      );
      setDocs(results.flat());
    } catch {}
    setLoading(false);
  };

  const handleGenerate = async (workspaceId: string) => {
    setGenerating(workspaceId);
    try {
      const res = await api.post("/docs/generate", { workspace_id: workspaceId });
      setDocs((prev) => {
        const exists = prev.find((d) => d.workspace_id === workspaceId);
        if (exists) return prev.map((d) => d.workspace_id === workspaceId ? res.data.doc : d);
        return [...prev, res.data.doc];
      });
      setSelectedDoc(res.data.doc);
    } catch {}
    setGenerating(null);
  };

  const handleTogglePublic = async (docId: string, isPublic: boolean) => {
    setTogglingId(docId);
    try {
      await api.put(`/docs/${docId}/toggle-public`);
      setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, is_public: !isPublic } : d));
      if (selectedDoc?.id === docId) setSelectedDoc((prev: any) => ({ ...prev, is_public: !isPublic }));
    } catch {}
    setTogglingId(null);
  };

  const handleExport = async (docId: string, format: string) => {
    try {
      const res = await api.get(`/docs/${docId}/export?format=${format}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `api-docs.${format === "openapi" ? "json" : "md"}`;
      a.click();
    } catch {}
  };

  const copyPublicLink = (slug: string) => {
    const link = `${window.location.origin}/docs/public/${slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* Sidebar — doc list */}
      <div style={{
        width: 320, borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        background: "rgba(4,4,12,0.6)",
        flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          height: "var(--header-height)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
            API Docs
          </h1>
          <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
            {docs.length} docs
          </span>
        </div>

        {/* Generate for workspaces */}
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Generate from workspace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(workspaces || []).map((w: any) => (
              <button
                key={w.id}
                onClick={() => handleGenerate(w.id)}
                disabled={generating === w.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8, cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)" }}>
                  {w.name}
                </span>
                <span style={{ fontSize: 11, color: generating === w.id ? "var(--accent)" : "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                  {generating === w.id ? "Generating..." : "Generate →"}
                </span>
              </button>
            ))}
            {(!workspaces || workspaces.length === 0) && (
              <p style={{ fontSize: 12, color: "var(--text-subtle)", textAlign: "center", padding: "8px 0" }}>
                No workspaces yet
              </p>
            )}
          </div>
        </div>

        {/* Doc list */}
        <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => <div key={i} style={{ height: 64, background: "var(--surface)", borderRadius: 8 }} />)}
            </div>
          ) : docs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>◈</div>
              <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>No docs generated yet</p>
            </div>
          ) : (
            docs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedDoc(doc)}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  marginBottom: 6,
                  cursor: "pointer",
                  background: selectedDoc?.id === doc.id ? "rgba(79,138,255,0.08)" : "transparent",
                  border: `1px solid ${selectedDoc?.id === doc.id ? "rgba(79,138,255,0.2)" : "transparent"}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                    {doc.workspace_name || "Workspace"}
                  </span>
                  {doc.is_public && (
                    <span style={{ fontSize: 9, color: "var(--accent3)", background: "rgba(52,211,153,0.1)", padding: "2px 6px", borderRadius: 3, fontFamily: "var(--font-dm-mono)", border: "1px solid rgba(52,211,153,0.2)" }}>
                      PUBLIC
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                    {doc.route_count || 0} routes
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                    {timeAgo(doc.updated_at || doc.created_at)}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main — doc viewer */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {selectedDoc ? (
          <>
            {/* Doc header */}
            <div style={{
              height: "var(--header-height)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 28px",
              borderBottom: "1px solid var(--border)",
              background: "rgba(2,2,10,0.8)",
              backdropFilter: "blur(20px)",
              position: "sticky", top: 0, zIndex: 40,
              flexShrink: 0,
            }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                  {selectedDoc.workspace_name || "API Documentation"}
                </h2>
                <p style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
                  {selectedDoc.route_count || 0} endpoints · Updated {timeAgo(selectedDoc.updated_at || selectedDoc.created_at)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Toggle public */}
                <button
                  onClick={() => handleTogglePublic(selectedDoc.id, selectedDoc.is_public)}
                  disabled={togglingId === selectedDoc.id}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                >
                  {togglingId === selectedDoc.id ? "..." : selectedDoc.is_public ? "Make Private" : "Make Public"}
                </button>

                {/* Copy public link */}
                {selectedDoc.is_public && (
                  <button
                    onClick={() => copyPublicLink(selectedDoc.slug)}
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: "7px 14px", color: copied ? "var(--accent3)" : undefined }}
                  >
                    {copied ? "✓ Copied" : "Copy Link"}
                  </button>
                )}

                {/* Export */}
                <button
                  onClick={() => handleExport(selectedDoc.id, "openapi")}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                >
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport(selectedDoc.id, "markdown")}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                >
                  Export MD
                </button>
              </div>
            </div>

            {/* Routes */}
            <div style={{ padding: 28 }}>
              {(selectedDoc.routes || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0" }}>
                  <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>No routes in this doc</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(selectedDoc.routes || []).map((route: any, i: number) => (
                    <RouteCard key={route.id || i} route={route} index={i} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>◈</div>
            <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>Select a doc or generate one from a workspace</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RouteCard({ route, index }: { route: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const color = METHOD_COLORS[route.method] || "var(--text-muted)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass"
      style={{ borderRadius: 12, overflow: "hidden" }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 18px", cursor: "pointer",
        }}
      >
        <span style={{
          fontSize: 11, fontFamily: "var(--font-dm-mono)", fontWeight: 700,
          color, background: `${color}15`,
          border: `1px solid ${color}30`,
          padding: "3px 8px", borderRadius: 4,
          minWidth: 56, textAlign: "center", flexShrink: 0,
        }}>
          {route.method}
        </span>
        <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)", flex: 1 }}>
          {route.path}
        </span>
        {route.description && (
          <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {route.description}
          </span>
        )}
        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", flexShrink: 0 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Parameters */}
              {route.parameters && route.parameters.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Parameters
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {route.parameters.map((p: any, j: number) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg)", borderRadius: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>{p.type}</span>
                        {p.required && <span style={{ fontSize: 10, color: "#f87171", fontFamily: "var(--font-dm-mono)" }}>required</span>}
                        {p.description && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request body */}
              {route.request_body && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Request Body
                  </div>
                  <pre style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", background: "var(--bg)", borderRadius: 8, padding: 14, overflow: "auto", margin: 0, maxHeight: 200 }}>
                    {typeof route.request_body === "string" ? route.request_body : JSON.stringify(route.request_body, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response */}
              {route.response_schema && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Response Schema
                  </div>
                  <pre style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", background: "var(--bg)", borderRadius: 8, padding: 14, overflow: "auto", margin: 0, maxHeight: 200 }}>
                    {typeof route.response_schema === "string" ? route.response_schema : JSON.stringify(route.response_schema, null, 2)}
                  </pre>
                </div>
              )}

              {/* Auth */}
              {route.auth_required !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>Auth required:</span>
                  <span style={{ fontSize: 11, color: route.auth_required ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-dm-mono)", fontWeight: 600 }}>
                    {route.auth_required ? "Yes" : "No"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}