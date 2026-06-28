"use client";

import { useRef, useState } from "react";
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

function extractPlaceholders(snippet: string): string[] {
  const matches = snippet.match(/\{([^}]+)\}/g) || [];
  return [...new Set(matches)];
}

type PlaceholderPopupProps = {
  placeholders: string[];
  onConfirm: (values: Record<string, string>) => void;
  onCancel: () => void;
};

function PlaceholderPopup({ placeholders, onConfirm, onCancel }: PlaceholderPopupProps) {
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
          <p style={{ fontFamily: "Instrument Serif", fontSize: 20, color: "var(--text)", margin: 0 }}>
            Fill in the blanks
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
            These placeholders were found in the snippet
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {placeholders.map((p, i) => (
            <div key={p}>
              <label style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {p.replace(/[{}]/g, "")}
              </label>
              {p === "{license}" ? (
                <select
                  value={values[p]}
                  onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))}
                  style={{
                    width: "100%", background: "var(--surface2)",
                    border: "1px solid var(--border2)", borderRadius: 6,
                    padding: "8px 12px", fontSize: 13, color: "var(--text)",
                    outline: "none", fontFamily: "Geist, sans-serif",
                  }}
                >
                  {["MIT", "Apache 2.0", "GPL v3", "BSD 3-Clause", "ISC", "Unlicensed"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              ) : (
                <input
                  autoFocus={i === 0}
                  value={values[p]}
                  onChange={e => setValues(v => ({ ...v, [p]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && onConfirm(values)}
                  placeholder={`Enter ${p.replace(/[{}]/g, "")}`}
                  style={{
                    width: "100%", background: "var(--surface2)",
                    border: "1px solid var(--border2)", borderRadius: 6,
                    padding: "8px 12px", fontSize: 13, color: "var(--text)",
                    outline: "none", fontFamily: "Geist, sans-serif",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--muted)", borderRadius: 6, padding: "6px 14px",
            fontSize: 12, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={() => onConfirm(values)} style={{
            background: "var(--accent)", border: "none", color: "#000",
            borderRadius: 6, padding: "6px 14px", fontSize: 12,
            fontWeight: 600, cursor: "pointer",
          }}>Insert</button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [markdown, setMarkdown] = useState(INITIAL_MD);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingSnippet, setPendingSnippet] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const doInsert = (snippet: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = editor.getSelection();
    if (!selection) return;
    editor.executeEdits("snippet-insert", [{
      range: selection,
      text: "\n\n" + snippet + "\n\n",
      forceMoveMarkers: true,
    }]);
    editor.focus();
  };

  const insertSnippet = (snippet: string) => {
    const found = extractPlaceholders(snippet);
    if (found.length > 0) {
      setPendingSnippet(snippet);
      setPlaceholders(found);
    } else {
      doInsert(snippet);
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

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
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
          <button
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              background: drawerOpen ? "var(--accent-dim)" : "var(--surface2)",
              border: `1px solid ${drawerOpen ? "var(--accent)" : "var(--border)"}`,
              color: drawerOpen ? "var(--accent)" : "var(--text)",
              fontSize: 12, borderRadius: 6, padding: "5px 12px",
              transition: "all 0.2s ease", cursor: "pointer"
            }}>
            {drawerOpen ? "✕ close snippets" : "⊞ snippets"}
          </button>
          <button style={{
            background: "var(--surface2)", border: "1px solid var(--border)",
            color: "var(--muted)", fontSize: 12, borderRadius: 6,
            padding: "5px 12px", cursor: "pointer",
          }}>
            Connect GitHub
          </button>
          <button style={{
            background: "var(--accent)", color: "#000", fontSize: 12,
            fontWeight: 600, borderRadius: 6, padding: "5px 14px",
            cursor: "pointer", border: "none",
          }}>
            Export
          </button>
        </div>
      </header>

      {/* Main pane */}
      <div className="flex overflow-hidden transition-all duration-300"
        style={{ flex: 1, marginBottom: drawerOpen ? DRAWER_HEIGHT : 0 }}>
        {/* Editor */}
        <div className="flex flex-col w-1/2 overflow-hidden" style={{ borderRight: "1px solid var(--border)" }}>
          <div style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
            className="flex items-center gap-2 px-4 py-2 shrink-0">
            <div className="flex gap-1.5">
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c840" }} />
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
              fontSize: 13,
              lineHeight: 22,
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

        <Preview markdown={markdown} />
      </div>

      {/* Snippet Drawer */}
      {drawerOpen && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: DRAWER_HEIGHT, zIndex: 50 }}>
          <SnippetDrawer onInsert={insertSnippet} onClose={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Placeholder popup */}
      {pendingSnippet && (
        <PlaceholderPopup
          placeholders={placeholders}
          onConfirm={handlePopupConfirm}
          onCancel={() => { setPendingSnippet(null); setPlaceholders([]); }}
        />
      )}
    </div>
  );
}