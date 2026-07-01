"use client";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function Preview({ markdown }: { markdown: string }) {
  return (
    <div className="preview-side flex flex-col w-1/2 overflow-hidden">
      <div className="tab-bar flex items-center px-4 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.06em" }} className="uppercase">
          Preview
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--bg)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "Geist, sans-serif", color: "var(--text)", lineHeight: 1.75 }}>
          <style>{`
            .md-preview h1 { font-family: 'Instrument Serif', serif; font-size: 2rem; font-weight: 400; color: #f0f0f2; margin-bottom: 0.5rem; }
            .md-preview h2 { font-size: 1.1rem; font-weight: 600; color: #c0c0c8; margin-top: 2rem; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
            .md-preview h3 { font-size: 1rem; font-weight: 500; color: #e0e0e4; }
            .md-preview p { color: #8888a0; font-size: 0.9rem; }
            .md-preview blockquote { border-left: 2px solid var(--accent); padding-left: 1rem; color: var(--muted); font-style: italic; margin: 1rem 0; }
            .md-preview code { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: var(--surface2); padding: 2px 6px; border-radius: 4px; color: var(--accent); }
            .md-preview pre { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; overflow-x: auto; }
            .md-preview pre code { background: none; padding: 0; color: #c8c8d4; }
            .md-preview a { color: var(--accent); text-decoration: none; }
            .md-preview ul { color: #8888a0; font-size: 0.9rem; }
            .md-preview img { border-radius: 4px; max-width: 100%; }
            .md-preview hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
            .md-preview table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            .md-preview th { border-bottom: 1px solid var(--border2); padding: 8px 12px; color: var(--muted); text-align: left; font-weight: 500; }
            .md-preview td { border-bottom: 1px solid var(--border); padding: 8px 12px; color: #8888a0; }
            .md-preview div[align="center"] { text-align: center; }
          `}</style>
          <div className="md-preview">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
