"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { useWorkspace } from "@/hooks/useWorkspace";
import { getMethodColor, getMethodBg, timeAgo } from "@/lib/utils";
import { aiAPI, historyAPI } from "@/lib/api";
import { useParams } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function WorkspacePage() {
  const { id } = useParams();
  const { workspace, routes, loading } = useWorkspace(id as string);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [requestBody, setRequestBody] = useState("");
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [response, setResponse] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");

  const handleTest = async () => {
    if (!selectedRoute) return;
    setTesting(true);
    setResponse(null);
    setDiagnosis(null);

    const start = Date.now();
    try {
      let parsedHeaders = {};
      try { parsedHeaders = JSON.parse(headers); } catch {}

      const res = await fetch(selectedRoute.path, {
        method: selectedRoute.method,
        headers: parsedHeaders,
        body: ["GET", "DELETE"].includes(selectedRoute.method)
          ? undefined
          : requestBody || undefined,
      });

      const duration = Date.now() - start;
      let data;
      try { data = await res.json(); } catch { data = await res.text(); }

      const result = {
        status: res.status,
        statusText: res.statusText,
        data,
        duration,
        headers: Object.fromEntries(res.headers.entries()),
      };

      setResponse(result);

      // Save to history
      await historyAPI.save({
        workspace_id: id,
        route_id: selectedRoute.id,
        method: selectedRoute.method,
        url: selectedRoute.path,
        headers: parsedHeaders,
        body: requestBody ? JSON.parse(requestBody) : null,
        status_code: res.status,
        response: data,
        duration_ms: duration,
      });

      // Auto diagnose if failed
      if (res.status >= 400) {
        setDiagnosing(true);
        try {
          const aiRes = await aiAPI.debug({
            method: selectedRoute.method,
            url: selectedRoute.path,
            statusCode: res.status,
            responseBody: data,
            workspaceId: id,
            routeId: selectedRoute.id,
          });
          setDiagnosis(aiRes.data.result);
        } catch {}
        setDiagnosing(false);
      }
    } catch (err: any) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        data: err.message,
        duration: Date.now() - start,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ flex: 1 }}>
      <Header title={workspace?.name || "Workspace"} />
      <div style={{ display: "flex", height: "calc(100vh - var(--header-height))" }}>

        {/* Routes sidebar */}
        <div style={{
          width: 280, borderRight: "1px solid var(--border)",
          overflowY: "auto", padding: 16, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "var(--font-dm-mono)", padding: "0 4px" }}>
            {routes.length} Routes
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: 44, background: "var(--surface)", borderRadius: 8 }} />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <p style={{ fontSize: 12, color: "var(--text-subtle)", lineHeight: 1.8 }}>
                No routes detected yet. Open this project in VS Code with the Axon extension installed.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {routes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { setSelectedRoute(route); setResponse(null); setDiagnosis(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 10px",
                    borderRadius: 8, cursor: "pointer",
                    background: selectedRoute?.id === route.id
                      ? "rgba(79,138,255,0.08)" : "transparent",
                    border: `1px solid ${selectedRoute?.id === route.id
                      ? "rgba(79,138,255,0.2)" : "transparent"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: getMethodColor(route.method),
                    background: getMethodBg(route.method),
                    padding: "2px 6px", borderRadius: 3,
                    fontFamily: "var(--font-dm-mono)",
                    minWidth: 40, textAlign: "center",
                  }}>
                    {route.method}
                  </span>
                  <span style={{
                    fontSize: 12, color: "var(--text-muted)",
                    fontFamily: "var(--font-dm-mono)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {route.path}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selectedRoute ? (
            <div style={{
              height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 16,
            }}>
              <div style={{ fontSize: 48, opacity: 0.3 }}>⊕</div>
              <p style={{ fontSize: 14, color: "var(--text-subtle)" }}>
                Select a route to test it
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={selectedRoute.id}
            >
              {/* Route header */}
              <div className="glass" style={{ borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: selectedRoute.description ? 12 : 0 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: getMethodColor(selectedRoute.method),
                    background: getMethodBg(selectedRoute.method),
                    padding: "4px 12px", borderRadius: 6,
                    fontFamily: "var(--font-dm-mono)",
                  }}>
                    {selectedRoute.method}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--text)", fontFamily: "var(--font-dm-mono)", flex: 1 }}>
                    {selectedRoute.path}
                  </span>
                  <button
                    onClick={handleTest}
                    disabled={testing}
                    className="btn btn-primary"
                    style={{ padding: "8px 20px", fontSize: 13 }}
                  >
                    {testing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }}
                      />
                    ) : "▶ Run"}
                  </button>
                </div>
                {selectedRoute.file_path && (
                  <div style={{ fontSize: 11, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                    {selectedRoute.file_path}{selectedRoute.line_number ? `:${selectedRoute.line_number}` : ""}
                  </div>
                )}
              </div>

              {/* Request tabs */}
              {!["GET", "DELETE"].includes(selectedRoute.method) && (
                <div className="glass" style={{ borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {(["body", "headers"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "6px 14px", borderRadius: 6,
                          background: activeTab === tab ? "var(--glow)" : "transparent",
                          border: `1px solid ${activeTab === tab ? "var(--accent)" : "transparent"}`,
                          color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
                          fontFamily: "var(--font-dm-mono)", fontSize: 12,
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={activeTab === "body" ? requestBody : headers}
                    onChange={(e) => activeTab === "body"
                      ? setRequestBody(e.target.value)
                      : setHeaders(e.target.value)
                    }
                    placeholder={activeTab === "body" ? '{\n  "key": "value"\n}' : '{\n  "Authorization": "Bearer token"\n}'}
                    style={{
                      width: "100%", minHeight: 140,
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      borderRadius: 8, padding: 14,
                      color: "var(--text)", fontFamily: "var(--font-dm-mono)",
                      fontSize: 13, outline: "none", resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              )}

              {/* Response */}
              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{ borderRadius: 14, padding: 20, marginBottom: 20 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: response.status >= 400 ? "#f87171" : "#34d399",
                        fontFamily: "var(--font-dm-mono)",
                      }}>
                        {response.status} {response.statusText}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-subtle)", fontFamily: "var(--font-dm-mono)" }}>
                        {response.duration}ms
                      </span>
                    </div>
                    <pre style={{
                      fontSize: 12, color: "var(--text-muted)",
                      fontFamily: "var(--font-dm-mono)", lineHeight: 1.6,
                      overflow: "auto", maxHeight: 300,
                      background: "var(--input-bg)", borderRadius: 8, padding: 14,
                    }}>
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Diagnosis */}
              <AnimatePresence>
                {(diagnosing || diagnosis) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{
                      borderRadius: 14, padding: 20,
                      border: "1px solid rgba(79,138,255,0.2)",
                      background: "rgba(79,138,255,0.04)",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <motion.div
                        animate={diagnosing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{ fontSize: 16 }}
                      >
                        ◈
                      </motion.div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-syne)" }}>
                        {diagnosing ? "AI is analyzing your code..." : "AI Diagnosis"}
                      </span>
                      {diagnosis && (
                        <span style={{
                          fontSize: 10, padding: "2px 8px",
                          background: diagnosis.severity === "high"
                            ? "rgba(248,113,113,0.1)" : "rgba(250,204,21,0.1)",
                          color: diagnosis.severity === "high" ? "#f87171" : "#facc15",
                          border: `1px solid ${diagnosis.severity === "high" ? "rgba(248,113,113,0.2)" : "rgba(250,204,21,0.2)"}`,
                          borderRadius: 4, fontFamily: "var(--font-dm-mono)",
                          marginLeft: "auto",
                        }}>
                          {diagnosis.severity?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {diagnosis && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "var(--font-dm-mono)" }}>
                            What went wrong
                          </div>
                          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                            {diagnosis.diagnosis}
                          </p>
                        </div>
                        {diagnosis.location && (
                          <div>
                            <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "var(--font-dm-mono)" }}>
                              Location
                            </div>
                            <code style={{ fontSize: 12, color: "var(--accent3)", fontFamily: "var(--font-dm-mono)" }}>
                              {diagnosis.location}
                            </code>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontFamily: "var(--font-dm-mono)" }}>
                            How to fix it
                          </div>
                          <pre style={{
                            fontSize: 12, color: "var(--accent3)",
                            fontFamily: "var(--font-dm-mono)", lineHeight: 1.6,
                            background: "rgba(52,211,153,0.05)",
                            border: "1px solid rgba(52,211,153,0.1)",
                            borderRadius: 8, padding: 14,
                            whiteSpace: "pre-wrap",
                          }}>
                            {diagnosis.fix}
                          </pre>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-subtle)", textAlign: "right" }}>
                          via {diagnosis.provider}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}