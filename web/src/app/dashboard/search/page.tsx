"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const METHOD_COLORS: Record<string, string> = {
  GET: "var(--accent3)",
  POST: "var(--accent)",
  PUT: "#facc15",
  PATCH: "var(--accent2)",
  DELETE: "#f87171",
};

const CATEGORIES = [
  { value: "all", label: "All", icon: "⊞" },
  { value: "workspaces", label: "Workspaces", icon: "◫" },
  { value: "routes", label: "Routes", icon: "⊹" },
  { value: "collections", label: "Collections", icon: "◈" },
  { value: "history", label: "History", icon: "◷" },
];

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSearched(false);
      return;
    }
    const timeout = setTimeout(() => search(), 400);
    return () => clearTimeout(timeout);
  }, [query, category]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get("/search", {
        params: { q: query, category: category === "all" ? undefined : category },
      });
      setResults(res.data);
      setSearched(true);
    } catch {}
    setLoading(false);
  };

  const totalResults = results
    ? (results.workspaces?.length || 0) +
      (results.routes?.length || 0) +
      (results.collections?.length || 0) +
      (results.history?.length || 0)
    : 0;

  const handleResultClick = (result: any) => {
    if (result.type === "workspace") router.push(`/dashboard/workspaces/${result.id}`);
    else if (result.type === "route") router.push(`/dashboard/workspaces/${result.workspace_id}`);
    else if (result.type === "collection") router.push(`/dashboard/collections`);
    else if (result.type === "history") router.push(`/dashboard/history`);
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px" }}>

      {/* Search input */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
            fontSize: 16, color: "var(--text-subtle)", pointerEvents: "none",
          }}>
            ⌕
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workspaces, routes, collections, history..."
            style={{
              width: "100%",
              padding: "16px 48px 16px 48px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
              fontFamily: "var(--font-dm-mono)",
              fontSize: 15, outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
            onBlur={(e) => e.target.style.borderColor = "var(--border)"}
          />
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
              }}
            />
          )}
          {!loading && query && (
            <button
              onClick={() => { setQuery(""); setResults(null); setSearched(false); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--text-subtle)", fontSize: 16,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20,
                background: category === cat.value ? "var(--glow)" : "transparent",
                border: `1px solid ${category === cat.value ? "var(--accent)" : "var(--border)"}`,
                color: category === cat.value ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-dm-mono)", fontSize: 12, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty state */}
      {!query && !searched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "64px 0" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>⌕</div>
          <p style={{ fontSize: 15, color: "var(--text-subtle)", marginBottom: 8 }}>
            Search everything in Axon
          </p>
          <p style={{ fontSize: 13, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", opacity: 0.6 }}>
            Workspaces · Routes · Collections · Request history
          </p>

          {/* Quick tips */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
            {[
              "Search by route path e.g. /users",
              "Search by HTTP method e.g. POST",
              "Search by workspace name",
              "Search by status code e.g. 401",
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => { setQuery(tip.split("e.g. ")[1] || ""); inputRef.current?.focus(); }}
                style={{
                  padding: "8px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 20, cursor: "pointer",
                  fontSize: 12, color: "var(--text-muted)",
                  fontFamily: "var(--font-dm-mono)",
                  transition: "border-color 0.15s",
                }}
              >
                {tip}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No results */}
      {searched && totalResults === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "64px 0" }}
        >
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◎</div>
          <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>
            No results for <span style={{ color: "var(--text)", fontFamily: "var(--font-dm-mono)" }}>"{query}"</span>
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results && totalResults > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Result count */}
            <div style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginBottom: 20 }}>
              {totalResults} result{totalResults !== 1 ? "s" : ""} for{" "}
              <span style={{ color: "var(--text)" }}>"{query}"</span>
            </div>

            {/* Workspaces */}
            {results.workspaces?.length > 0 && (
              <ResultSection title="Workspaces" icon="◫" count={results.workspaces.length}>
                {results.workspaces.map((w: any, i: number) => (
                  <ResultItem
                    key={w.id} index={i}
                    onClick={() => handleResultClick({ ...w, type: "workspace" })}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, color: "var(--accent)" }}>◫</span>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
                          {w.route_count || 0} routes · Updated {timeAgo(w.updated_at || w.created_at)}
                        </div>
                      </div>
                    </div>
                  </ResultItem>
                ))}
              </ResultSection>
            )}

            {/* Routes */}
            {results.routes?.length > 0 && (
              <ResultSection title="Routes" icon="⊹" count={results.routes.length}>
                {results.routes.map((r: any, i: number) => (
                  <ResultItem
                    key={r.id} index={i}
                    onClick={() => handleResultClick({ ...r, type: "route" })}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 11, fontFamily: "var(--font-dm-mono)", fontWeight: 700,
                        color: METHOD_COLORS[r.method] || "var(--text-muted)",
                        background: `${METHOD_COLORS[r.method] || "var(--text-muted)"}15`,
                        border: `1px solid ${METHOD_COLORS[r.method] || "var(--text-muted)"}30`,
                        padding: "2px 8px", borderRadius: 4,
                        minWidth: 52, textAlign: "center", flexShrink: 0,
                      }}>
                        {r.method}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)" }}>{r.path}</div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
                          {r.workspace_name} · {timeAgo(r.created_at)}
                        </div>
                      </div>
                    </div>
                  </ResultItem>
                ))}
              </ResultSection>
            )}

            {/* Collections */}
            {results.collections?.length > 0 && (
              <ResultSection title="Collections" icon="◈" count={results.collections.length}>
                {results.collections.map((c: any, i: number) => (
                  <ResultItem
                    key={c.id} index={i}
                    onClick={() => handleResultClick({ ...c, type: "collection" })}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 16, color: "var(--accent2)" }}>◈</span>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)", marginTop: 2 }}>
                          {c.route_count || 0} routes · {timeAgo(c.created_at)}
                        </div>
                      </div>
                    </div>
                  </ResultItem>
                ))}
              </ResultSection>
            )}

            {/* History */}
            {results.history?.length > 0 && (
              <ResultSection title="Request History" icon="◷" count={results.history.length}>
                {results.history.map((h: any, i: number) => (
                  <ResultItem
                    key={h.id} index={i}
                    onClick={() => handleResultClick({ ...h, type: "history" })}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 11, fontFamily: "var(--font-dm-mono)", fontWeight: 700,
                        color: METHOD_COLORS[h.method] || "var(--text-muted)",
                        background: `${METHOD_COLORS[h.method] || "var(--text-muted)"}15`,
                        border: `1px solid ${METHOD_COLORS[h.method] || "var(--text-muted)"}30`,
                        padding: "2px 8px", borderRadius: 4,
                        minWidth: 52, textAlign: "center", flexShrink: 0,
                      }}>
                        {h.method}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-dm-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {h.path}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 2 }}>
                          {timeAgo(h.created_at)}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, fontFamily: "var(--font-dm-mono)", fontWeight: 700, flexShrink: 0,
                        color: h.status_code >= 400 ? "#f87171" : h.status_code >= 300 ? "#facc15" : "var(--accent3)",
                      }}>
                        {h.status_code}
                      </span>
                    </div>
                  </ResultItem>
                ))}
              </ResultSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultSection({ title, icon, count, children }: {
  title: string; icon: string; count: number; children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp} initial="hidden" animate="visible"
      style={{ marginBottom: 28 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: "var(--text-subtle)" }}>{icon}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {title}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
          ({count})
        </span>
      </div>
      <div className="glass" style={{ borderRadius: 12, overflow: "hidden" }}>
        {children}
      </div>
    </motion.div>
  );
}

function ResultItem({ children, onClick, index }: {
  children: React.ReactNode; onClick: () => void; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </motion.div>
  );
}