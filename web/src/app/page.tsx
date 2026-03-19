"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const VIDEOS = {
  hero: "https://ik.imagekit.io/kwujelxax/grok-video-dd70d72d-ac62-4869-9e7f-d4955d62d034.mp4?updatedAt=1772649849933",
  problem: "https://ik.imagekit.io/kwujelxax/grok-video-df3afac1-8358-4828-8ffa-e09dea8a66a0.mp4?updatedAt=1772649853031",
  demo: "https://ik.imagekit.io/kwujelxax/grok-video-814a07b1-4024-4476-866b-1017ed47bcb8.mp4?updatedAt=1772649850888",
  ai: "https://ik.imagekit.io/kwujelxax/grok-video-1f538aea-1cd2-4283-b025-4d0e6202b458.mp4?updatedAt=1772649851207",
  teams: "https://ik.imagekit.io/kwujelxax/grok-video-73a395ee-d998-4a93-97d6-dd6e9303817c.mp4?updatedAt=1772649848633",
  cta: "https://ik.imagekit.io/kwujelxax/grok-video-af0542d3-7823-4027-b721-0972839fd086.mp4?updatedAt=1772649847772",
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function VideoBackground({ src, opacity = 0.15 }: { src: string; opacity?: number }) {
  return (
    <video
      autoPlay muted loop playsInline
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity, zIndex: 0 }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number }[] = [];
    for (let i = 0; i < 280; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((s) => {
        s.twinkle += 0.015;
        const opacity = s.opacity * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 210, 255, ${opacity})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      });

      const nebulas = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 300, color: "rgba(79,138,255,0.04)" },
        { x: canvas.width * 0.8, y: canvas.height * 0.6, r: 250, color: "rgba(167,139,250,0.04)" },
        { x: canvas.width * 0.5, y: canvas.height * 0.8, r: 200, color: "rgba(52,211,153,0.03)" },
      ];
      nebulas.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(2,2,10,0)", "rgba(2,2,10,0.95)"]);

  const handleWaitlist = async () => {
    if (!email || !email.includes("@")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setJoined(true);
    setEmail("");
  };

  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <GalaxyCanvas />

      {/* NAV */}
      <motion.nav
        style={{
          background: navBg,
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 48px", height: 64,
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <a href="#" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 22, color: "var(--text)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
          />
          Axon
        </a>
        <div style={{ display: "flex", gap: 36 }}>
          {["How it works", "Features", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/auth/login" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 8 }}>
            Sign in
          </a>
          <a href="/auth/signup" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, color: "#fff", textDecoration: "none", padding: "10px 20px", background: "var(--accent)", borderRadius: 8, boxShadow: "0 0 24px var(--glow)" }}>
            Get started free
          </a>
        </div>
      </motion.nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 48px 80px", position: "relative", overflow: "hidden" }}>
        <VideoBackground src={VIDEOS.hero} opacity={0.18} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(79,138,255,0.12) 0%, transparent 70%)", zIndex: 1 }} />

        <motion.div variants={stagger} initial="hidden" animate="visible" style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
          <motion.div variants={fadeUp} custom={0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, fontSize: 12, color: "var(--text-muted)", marginBottom: 40, backdropFilter: "blur(10px)", fontFamily: "var(--font-dm-mono)" }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent3)", boxShadow: "0 0 8px var(--accent3)" }} />
            Now in early access
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(52px, 8vw, 96px)", lineHeight: 0.95, letterSpacing: "-3px", marginBottom: 32, color: "var(--text)" }}>
            API testing that<br />
            <span style={{ color: "var(--accent)", fontStyle: "italic" }}>knows your code</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            style={{ fontSize: 17, lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 48px", fontFamily: "var(--font-dm-mono)", fontWeight: 300 }}>
            Axon lives in VS Code. It finds your routes, runs your requests, and fixes failures with AI — without you leaving your editor.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 64, flexWrap: "wrap" }}>
            <a href="/auth/signup" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 15, color: "#fff", textDecoration: "none", padding: "14px 32px", background: "var(--accent)", borderRadius: 10, boxShadow: "0 0 40px var(--glow-strong)" }}>
              Start for free
            </a>
            <a href="#how-it-works" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 15, color: "var(--text-muted)", textDecoration: "none", padding: "14px 32px", border: "1px solid var(--border)", borderRadius: 10 }}>
              See how it works
            </a>
          </motion.div>

          {/* Terminal */}
          <motion.div variants={fadeUp} custom={4}
            style={{ background: "rgba(5,5,15,0.7)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, maxWidth: 580, margin: "0 auto", textAlign: "left", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
            </div>
            {[
              { prompt: "axon", cmd: " scan", color: "var(--text)" },
              { output: "→ Scanning workspace...", color: "var(--accent)" },
              { output: "✓ Found 12 routes across 4 files", color: "var(--accent3)" },
              { output: "→ Running POST /auth/login", color: "var(--accent)" },
              { output: "✗ 401 — JWT secret mismatch", color: "#f87171" },
              { output: "✓ AI found issue in auth.middleware.ts:34", color: "var(--accent3)" },
            ].map((line, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.3, duration: 0.4 }}
                style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, lineHeight: 2, color: (line as any).color || "var(--text-muted)" }}>
                {"prompt" in line ? <><span style={{ color: "var(--accent3)" }}>{line.prompt}</span><span style={{ color: "var(--text)" }}>{line.cmd}</span></> : (line as any).output}
              </motion.div>
            ))}
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ display: "inline-block", width: 8, height: 14, background: "var(--accent)", verticalAlign: "middle", marginTop: 4 }} />
          </motion.div>
        </motion.div>
      </section>

      {/* PROBLEM */}
      <section id="problem" style={{ padding: "120px 48px", position: "relative", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
        <VideoBackground src={VIDEOS.problem} opacity={0.1} />
        <div style={{ position: "absolute", inset: 0, background: "var(--bg2)", opacity: 0.7, zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
              The problem
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 64 }}>
              Postman doesn&apos;t know<br /><span style={{ color: "var(--accent2)", fontStyle: "italic" }}>your codebase.</span>
            </motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { icon: "😤", title: "You copy routes manually", desc: "Every tool makes you paste URLs one by one. Your API client knows nothing about your code." },
                  { icon: "🔍", title: "Debugging is guesswork", desc: "You get a 500. You Google it. You open ChatGPT. You dig through files. Nothing is connected." },
                  { icon: "🔀", title: "Too many tabs", desc: "Editor, terminal, Postman, browser — constant context switching kills focus and momentum." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i}
                    style={{ display: "flex", gap: 16, padding: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, backdropFilter: "blur(10px)" }}>
                    <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{item.title}</div>
                      <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 300 }}>{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div variants={fadeUp}
                style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16/9", position: "relative" }}>
                <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                  <source src={VIDEOS.problem} type="video/mp4" />
                </video>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "120px 48px", position: "relative", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
              How it works
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 72 }}>
              Install. Scan. Ship.<br /><span style={{ color: "var(--accent)", fontStyle: "italic" }}>That&apos;s it.</span>
            </motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, background: "var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 72 }}>
              {[
                { n: "01", title: "Install the extension", desc: "One install from the VS Code marketplace. Sign in with GitHub. Done." },
                { n: "02", title: "Axon scans your project", desc: "Every route in your codebase — found automatically. No setup, no config." },
                { n: "03", title: "Test and fix with AI", desc: "Run any request in one click. When it fails, AI reads your code and tells you exactly why." },
              ].map((step, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  whileHover={{ background: "var(--bg2)" }}
                  style={{ background: "var(--bg)", padding: "48px 36px", textAlign: "left", position: "relative", cursor: "default" }}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--accent)", transformOrigin: "left" }} />
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 72, fontWeight: 800, color: "var(--border-strong)", lineHeight: 1, marginBottom: 24, letterSpacing: "-4px", opacity: 0.3 }}>{step.n}</div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>{step.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 300 }}>{step.desc}</div>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeUp}
              style={{ borderRadius: 20, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "16/9", position: "relative", maxWidth: 960, margin: "0 auto" }}>
              <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                <source src={VIDEOS.demo} type="video/mp4" />
              </video>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 50%, var(--bg) 100%)", pointerEvents: "none" }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI SECTION */}
      <section style={{ padding: "120px 48px", position: "relative", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
        <VideoBackground src={VIDEOS.ai} opacity={0.12} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(79,138,255,0.08) 0%, transparent 70%)", zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
              AI Debugging
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 24 }}>
              It doesn&apos;t just show the error.<br /><span style={{ color: "var(--accent2)", fontStyle: "italic" }}>It fixes it.</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 64px", fontWeight: 300 }}>
              Axon reads the actual function that failed, understands the context, and gives you a precise fix — not a generic hint.
            </motion.p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, textAlign: "left" }}>
              <motion.div variants={fadeUp}
                style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, backdropFilter: "blur(20px)" }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-subtle)", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-dm-mono)" }}>Without Axon</div>
                <div style={{ fontSize: 13, lineHeight: 1.9, color: "var(--text-muted)", fontWeight: 300 }}>
                  <span style={{ color: "#f87171" }}>POST /users/login → 401</span><br /><br />
                  Google it. Stack Overflow. ChatGPT. Still broken 40 minutes later.
                </div>
              </motion.div>
              <motion.div variants={fadeUp}
                style={{ background: "rgba(79,138,255,0.05)", border: "1px solid var(--accent)", borderRadius: 16, padding: 32, backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-subtle)", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-dm-mono)" }}>With Axon</div>
                <div style={{ fontSize: 13, lineHeight: 1.9, color: "var(--text-muted)", fontWeight: 300 }}>
                  <span style={{ color: "#f87171" }}>POST /users/login → 401</span><br /><br />
                  <span style={{ color: "var(--accent3)" }}>✓ auth.middleware.ts line 34</span><br />
                  JWT_SECRET mismatch. Update your .env.<br /><br />
                  <span style={{ color: "var(--accent3)" }}>Fixed in 8 seconds.</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "120px 48px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
              Features
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 72 }}>
              Built for developers.<br /><span style={{ color: "var(--accent2)", fontStyle: "italic" }}>Not for demos.</span>
            </motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[
                { icon: "⚡", title: "Auto route detection", desc: "Scans your codebase and finds every API route. Express and NestJS supported out of the box.", tag: "Core" },
                { icon: "🧠", title: "AI debugging", desc: "Reads the exact code that failed. Tells you what went wrong and how to fix it.", tag: "AI" },
                { icon: "🔗", title: "GitHub integration", desc: "Connect any repo. Axon pulls it, scans it, ready to test immediately.", tag: "Integration" },
                { icon: "👥", title: "Team workspaces", desc: "Invite your team. Share collections and history. One dashboard for everyone.", tag: "Teams" },
                { icon: "📋", title: "Request history", desc: "Every request saved and searchable. Accessible from VS Code and the web.", tag: "Core" },
                { icon: "🌐", title: "Web dashboard", desc: "Test live APIs, manage environments, and track usage from anywhere.", tag: "Web" },
              ].map((f, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  whileHover={{ y: -6, borderColor: "var(--border-strong)" }}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, position: "relative", overflow: "hidden", cursor: "default" }}>
                  <div style={{ fontSize: 28, marginBottom: 20 }}>{f.icon}</div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>{f.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text-muted)", fontWeight: 300, marginBottom: 20 }}>{f.desc}</div>
                  <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--glow)", border: "1px solid var(--accent)", borderRadius: 100, fontSize: 11, color: "var(--accent)", letterSpacing: "0.05em", fontFamily: "var(--font-dm-mono)" }}>{f.tag}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEAMS */}
      <section id="teams" style={{ padding: "120px 48px", position: "relative", overflow: "hidden", borderTop: "1px solid var(--border)" }}>
        <VideoBackground src={VIDEOS.teams} opacity={0.08} />
        <div style={{ position: "absolute", inset: 0, background: "var(--bg2)", opacity: 0.75, zIndex: 1 }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <div>
                <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
                  <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
                  For teams
                </motion.div>
                <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(32px, 4vw, 56px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 24 }}>
                  Your whole team.<br /><span style={{ color: "var(--accent2)", fontStyle: "italic" }}>One workspace.</span>
                </motion.h2>
                <motion.p variants={fadeUp} style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 40, fontWeight: 300 }}>
                  Shared routes, shared history, shared context. Everyone moves at the speed of your fastest engineer.
                </motion.p>
                {[
                  { icon: "🔑", title: "Roles & permissions", desc: "Admin, Editor, and Viewer roles — full control over who can test or view." },
                  { icon: "📁", title: "Shared collections", desc: "Organize APIs into collections. Instantly available to your whole team." },
                  { icon: "🏢", title: "GitHub org support", desc: "Connect your org. Every repo, every route, one place." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--glow)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, fontWeight: 300 }}>{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div variants={fadeUp}>
                {[
                  { emoji: "👨‍💻", name: "David — Admin", status: "Testing POST /payments/charge", color: "rgba(79,138,255,0.15)" },
                  { emoji: "👩‍💻", name: "Sarah — Editor", status: "Viewing GET /users collection", color: "rgba(167,139,250,0.15)" },
                  { emoji: "🧑‍💻", name: "James — Editor", status: "Fixed auth middleware via AI", color: "rgba(52,211,153,0.15)" },
                ].map((member, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    whileHover={{ borderColor: "var(--border-strong)", background: "var(--surface-hover)" }}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, marginBottom: 14, backdropFilter: "blur(10px)" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: member.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{member.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{member.status}</div>
                    </div>
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent3)", boxShadow: "0 0 8px var(--accent3)" }} />
                  </motion.div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 20, background: "var(--surface)", border: "1px dashed var(--border-strong)", borderRadius: 14, opacity: 0.4 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1px dashed var(--border-strong)" }}>➕</div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Invite teammate</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 48px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
              Pricing
              <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
            </motion.div>
            <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 72 }}>
              Free to start.<br /><span style={{ color: "var(--accent)", fontStyle: "italic" }}>Scale when you&apos;re ready.</span>
            </motion.h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[
                {
                  plan: "Free", price: "$0", desc: "Everything to get started.", featured: false,
                  features: ["VS Code extension", "Auto route detection", "50 AI requests/month", "1 workspace", "30 days history"],
                },
                {
                  plan: "Pro", price: "$9", desc: "For developers who ship fast.", featured: true,
                  features: ["Everything in Free", "1,000 AI requests/month", "3 workspaces", "Unlimited history", "API key access"],
                },
                {
                  plan: "Team", price: "$24", desc: "For teams that move together.", featured: false,
                  features: ["Everything in Pro", "5,000 AI requests/month", "Unlimited workspaces", "10 members", "Admin dashboard"],
                },
              ].map((tier, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  whileHover={{ y: -6 }}
                  style={{ background: tier.featured ? "rgba(79,138,255,0.06)" : "var(--surface)", border: `1px solid ${tier.featured ? "var(--accent)" : "var(--border)"}`, borderRadius: 20, padding: "40px 32px", textAlign: "left", position: "relative" }}>
                  {tier.featured && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "white", fontSize: 11, padding: "4px 14px", borderRadius: 100, fontFamily: "var(--font-dm-mono)", whiteSpace: "nowrap" }}>Most Popular</div>
                  )}
                  {tier.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />}
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 20 }}>{tier.plan}</div>
                  <div style={{ fontFamily: "var(--font-syne)", fontSize: 52, fontWeight: 800, color: "var(--text)", letterSpacing: "-2px", lineHeight: 1, marginBottom: 8 }}>
                    {tier.price}<span style={{ fontSize: 18, fontWeight: 400, color: "var(--text-muted)", letterSpacing: 0 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--border)", fontWeight: 300 }}>{tier.desc}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                    {tier.features.map((f, j) => (
                      <li key={j} style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 10, fontWeight: 300 }}>
                        <span style={{ color: "var(--accent3)", fontWeight: 700 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <a href="/auth/signup" style={{ display: "block", textAlign: "center", padding: 14, fontFamily: "var(--font-dm-mono)", fontSize: 13, color: tier.featured ? "#fff" : "var(--text-muted)", textDecoration: "none", background: tier.featured ? "var(--accent)" : "transparent", border: `1px solid ${tier.featured ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, boxShadow: tier.featured ? "0 0 24px var(--glow)" : "none" }}>
                    Get started free
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* WAITLIST / CTA */}
      <section id="waitlist" style={{ padding: "120px 48px", position: "relative", overflow: "hidden", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <VideoBackground src={VIDEOS.cta} opacity={0.15} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(79,138,255,0.1) 0%, transparent 60%)", zIndex: 1 }} />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ position: "relative", zIndex: 2, maxWidth: 600, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "var(--font-dm-mono)" }}>
            <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
            Early access
            <div style={{ width: 24, height: 1, background: "var(--accent)" }} />
          </motion.div>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05, letterSpacing: "-2px", color: "var(--text)", marginBottom: 24 }}>
            Start building.<br /><span style={{ color: "var(--accent)", fontStyle: "italic" }}>It&apos;s free.</span>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 32, fontWeight: 300 }}>
            Join the waitlist and get early access when we launch.
          </motion.p>

          {joined ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "20px 32px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 12, fontSize: 15, color: "var(--accent3)", fontFamily: "var(--font-dm-mono)" }}>
              ✓ You&apos;re on the list. We&apos;ll reach out soon.
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                placeholder="your@email.com"
                style={{ flex: 1, padding: "14px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontFamily: "var(--font-dm-mono)", fontSize: 14, color: "var(--text)", outline: "none" }}
              />
              <button onClick={handleWaitlist}
                style={{ fontFamily: "var(--font-dm-mono)", fontSize: 14, color: "#fff", padding: "14px 28px", background: "var(--accent)", border: "none", borderRadius: 10, cursor: "pointer", boxShadow: "0 0 32px var(--glow-strong)", whiteSpace: "nowrap" }}>
                Join waitlist
              </button>
            </motion.div>
          )}

          <motion.div variants={fadeUp} style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24 }}>
            <a href="/auth/signup" style={{ fontFamily: "var(--font-dm-mono)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", padding: "10px 24px", border: "1px solid var(--border)", borderRadius: 8 }}>
              Create account instead →
            </a>
          </motion.div>
          <motion.p variants={fadeUp} style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 16 }}>No spam. Ever.</motion.p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "64px 48px 40px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }}>
            <div>
              <a href="#" style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 20, color: "var(--text)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
                Axon
              </a>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginTop: 16, maxWidth: 280, fontWeight: 300 }}>
                API testing that lives in your editor and actually understands your code.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Developers", links: ["Documentation", "VS Code Extension", "GitHub", "API Reference"] },
              { title: "Company", links: ["About", "Blog", "Privacy", "Terms"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 20, letterSpacing: "0.05em" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map((link, j) => (
                    <a key={j} href="#" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", fontWeight: 300 }}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 32, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>© 2026 Axon. Built for developers who move fast.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {["𝕏", "⌥", "◈"].map((icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, textDecoration: "none", color: "var(--text-muted)" }}>{icon}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
