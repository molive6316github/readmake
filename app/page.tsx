"use client";

import { useRef, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Editor, { OnMount } from "@monaco-editor/react";
import Preview from "@/components/Preview";
import SnippetDrawer from "@/components/SnippetDrawer";
import * as monaco from "monaco-editor";

const INITIAL_MD = `# My Project

> A short, punchy description of what this does and why it exists.

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## Usage

\`\`\`js
import myPackage from 'my-package';
myPackage.doSomething();
\`\`\`
`;

const DRAWER_HEIGHT = 280;

const GITHUB_AUTO_FILL: Record<string, (session: any) => string> = {
  "{user}": (s) => s?.user?.login || "",
  "{name}": (s) => s?.user?.name || "",
};

function extractPlaceholders(snippet: string): string[] {
  const matches = snippet.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches)];
}

type Repo = { full_name: string; name: string; owner: { login: string } };

function RepoPicker({ onSelect, onClose, session }: {
  onSelect: (repo: Repo) => void;
  onClose: () => void;
  session: any;
}) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github/repos", {
      headers: { Authorization: `Bearer ${session?.accessToken}` }
    }).then(r => r.json()).then(data => {
      setRepos(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [session]);

  const filtered = repos.filter(r => r.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border2)",
        borderRadius: 12, padding: 24, width: 440,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: "Instrument Serif", fontSize: 20, color: "var(--text)", margin: 0 }}>Pick a repo</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <input
          autoFocus
          placeholder="Search repos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", background: "var(--surface2)",
            border: "1px solid var(--border2)", borderRadius: 6,
            padding: "8px 12px", fontSize: 13, color: "var(--text)",
            outline: "none", fontFamily: "Geist, sans-serif", marginBottom: 12,
          }}
        />
        <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {loading && <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>Loading...</p>}
          {!loading && filtered.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No repos found</p>}
          {filtered.map(repo => (
            <button
              key={repo.full_name}
              onClick={() => onSelect(repo)}
              style={{
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 14px", cursor: "pointer",
                textAlign: "left", color: "var(--text)", fontSize: 13,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <span style={{ color: "var(--muted)" }}>{repo.owner.login}/</span>
              <span style={{ fontWeight: 500 }}>{repo.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPopup({ placeholders, onConfirm, onCancel }: {
  placeholders: string[];
  onConfirm: (values: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(placeholders.map(p => [p, p === "{license}" ? "MIT" : ""]))
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border2)",
        borderRadius: 12, padding: 24, minWidth: 360, maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "Instrument Serif", fontSize: 20, color: "var(--text)", margin: 0 }}>Fill in the blanks</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>These placeholders were found in the snippet</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {placeholders.map((p, i) => (
            <div key={p}>
              <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {p.replace(/[{}]/g, "")}
              </label>
              {p === "{license}" ? (
                <select value={values[p]} onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}>
                  {["MIT", "Apache 2.0", "GPL v3", "BSD 3-Clause", "ISC", "Unlicensed"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              ) : (
                <input autoFocus={i === 0} value={values[p]}
                  onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && onConfirm(values)}
                  placeholder={`Enter ${p.replace(/[{}]/g, "")}`}
                  style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "var(--text)", outline: "none" }}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(values)} style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Insert</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, ok }: { message: string; ok: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      background: ok ? "var(--accent)" : "#ef4444",
      color: "#fff",
      borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      animation: "slideUp 0.2s ease",
    }}>
      {message}
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [markdown, setMarkdown] = useState(INITIAL_MD);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSnippet, setPendingSnippet] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [showRepoPicker, setShowRepoPicker] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);

  const showToast = (message: string, ok: boolean) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMount: OnMount = (editor) => { editorRef.current = editor; };

  const doInsert = (snippet: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    editor.executeEdits("snippet-insert", [{ range: selection, text: "\n\n" + snippet + "\n\n", forceMoveMarkers: true }]);
    editor.focus();
  };

  const insertSnippet = (snippet: string) => {
    let prefilled = snippet;
    if (session) {
      for (const [placeholder, getter] of Object.entries(GITHUB_AUTO_FILL)) {
        const val = getter(session);
        if (val) prefilled = prefilled.replaceAll(placeholder, val);
      }
    }
    if (selectedRepo) {
      prefilled = prefilled.replaceAll("{repo}", selectedRepo.name);
    }
    const found = extractPlaceholders(prefilled);
    if (found.length > 0) {
      setPendingSnippet(prefilled);
      setPlaceholders(found);
    } else {
      doInsert(prefilled);
    }
  };

  const handlePopupConfirm = (values: Record<string, string>) => {
    if (!pendingSnippet) return;
    let filled = pendingSnippet;
    for (const [placeholder, value] of Object.entries(values)) {
      filled = filled.replaceAll(placeholder, value || placeholder);
    }
    doInsert(filled);
    setPendingSnippet(null);
    setPlaceholders([]);
  };

  const handleExport = async () => {
    if (!session) {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "README.md"; a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (!selectedRepo) {
      setShowRepoPicker(true);
      return;
    }
    try {
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ owner: selectedRepo.owner.login, repo: selectedRepo.name, content: markdown }),
      });
      if (res.ok) showToast(`pushed to ${selectedRepo.full_name} ✓`, true);
      else showToast("push failed", false);
    } catch {
      showToast("push failed", false);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
        className="flex items-center justify-between px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "Instrument Serif", fontSize: 20, color: "var(--text)" }}>
            read<span style={{ color: "var(--accent)" }}>make</span>
          </span>
          <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.08em" }} className="uppercase">
            markdown editor
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedRepo && (
            <span style={{ fontSize: 12, color: "var(--muted)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 10px" }}>
              {selectedRepo.full_name}
            </span>
          )}
          <button onClick={() => setDrawerOpen(v => !v)} style={{
            background: drawerOpen ? "var(--accent-dim)" : "var(--surface2)",
            border: `1px solid ${drawerOpen ? "var(--accent)" : "var(--border)"}`,
            color: drawerOpen ? "var(--accent)" : "var(--text)",
            fontSize: 12, borderRadius: 6, padding: "5px 12px",
            transition: "all 0.2s ease", cursor: "pointer"
          }}>
            {drawerOpen ? "✕ close snippets" : "⊞ snippets"}
          </button>
          <button
            onClick={() => session ? setShowRepoPicker(true) : signIn("github")}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border)",
              color: session ? "var(--accent)" : "var(--muted)", fontSize: 12, borderRadius: 6,
              padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
            }}>
            {session ? `✓ ${session.user?.name}` : "Connect GitHub"}
          </button>
          <button onClick={handleExport} style={{
            background: "var(--accent)", color: "#fff", fontSize: 12,
            fontWeight: 600, borderRadius: 6, padding: "5px 14px",
            cursor: "pointer", border: "none",
          }}>
            {session && selectedRepo ? "Push to GitHub" : session ? "Pick Repo" : "Export"}
          </button>
        </div>
      </header>

      <div className="flex overflow-hidden transition-all duration-300"
        style={{ flex: 1, marginBottom: drawerOpen ? DRAWER_HEIGHT : 0 }}>

        {/* editor side — warm */}
        <div className="editor-side flex flex-col w-1/2 overflow-hidden">
          <div className="tab-bar flex items-center gap-2 px-4 py-2 shrink-0"
            style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
            <div className="flex gap-1.5">
              <div className="dot-red" style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div className="dot-yellow" style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div className="dot-green" style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c840" }} />
            </div>
            <span style={{ color: "var(--muted)", fontSize: 11, marginLeft: 8, letterSpacing: "0.06em" }} className="uppercase">
              README.md
            </span>
          </div>
          <Editor
            defaultValue={INITIAL_MD}
            language="markdown"
            theme="vs-dark"
            onMount={handleMount}
            onChange={(val) => setMarkdown(val || "")}
            options={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13, lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 20, bottom: 20 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
              lineNumbers: "off",
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 16,
              contextmenu: false,
            }}
          />
        </div>

        {/* preview side — cool */}
        <Preview markdown={markdown} />
      </div>

      {drawerOpen && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: DRAWER_HEIGHT, zIndex: 50 }}>
          <SnippetDrawer onInsert={insertSnippet} onClose={() => setDrawerOpen(false)} />
        </div>
      )}

      {pendingSnippet && (
        <PlaceholderPopup
          placeholders={placeholders}
          onConfirm={handlePopupConfirm}
          onCancel={() => { setPendingSnippet(null); setPlaceholders([]); }}
        />
      )}

      {showRepoPicker && (
        <RepoPicker
          onSelect={(repo) => { setSelectedRepo(repo); setShowRepoPicker(false); }}
          onClose={() => setShowRepoPicker(false)}
          session={session}
        />
      )}

      {toast && <Toast message={toast.message} ok={toast.ok} />}
    </div>
  );
}
