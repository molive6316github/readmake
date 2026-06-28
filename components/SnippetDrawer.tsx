"use client";

const SNIPPETS = [
  { id: "badge-license", label: "License Badge", category: "Badges", icon: "⚖️", content: `![License](https://img.shields.io/badge/license-{license}-blue)` },
  { id: "badge-npm", label: "npm Version", category: "Badges", icon: "📦", content: `![npm](https://img.shields.io/npm/v/{package})` },
  { id: "badge-build", label: "Build Status", category: "Badges", icon: "🔨", content: `![Build](https://img.shields.io/github/actions/workflow/status/{user}/{repo}/ci.yml)` },
  { id: "badge-stars", label: "GitHub Stars", category: "Badges", icon: "⭐", content: `![Stars](https://img.shields.io/github/stars/{user}/{repo})` },
  { id: "badge-coverage", label: "Coverage", category: "Badges", icon: "🧪", content: `![Coverage](https://img.shields.io/codecov/c/github/{user}/{repo})` },
  { id: "badge-discord", label: "Discord", category: "Badges", icon: "💬", content: `[![Discord](https://img.shields.io/discord/{discord-id}?color=5865F2&label=discord)](https://discord.gg/{invite})` },
  { id: "section-install", label: "Installation", category: "Sections", icon: "⬇️", content: `## Installation\n\n\`\`\`bash\nnpm install {package}\n\`\`\`` },
  { id: "section-usage", label: "Usage", category: "Sections", icon: "🚀", content: `## Usage\n\n\`\`\`js\nimport pkg from '{package}';\n\npkg.doSomething();\n\`\`\`` },
  { id: "section-features", label: "Features", category: "Sections", icon: "✨", content: `## Features\n\n- ⚡ Fast and lightweight\n- 🔧 Easy to configure\n- 📦 Zero dependencies\n- 🌍 Works everywhere` },
  { id: "section-contributing", label: "Contributing", category: "Sections", icon: "🤝", content: `## Contributing\n\nPull requests are welcome! For major changes, please open an issue first.\n\nPlease make sure to update tests as appropriate.` },
  { id: "section-license", label: "License", category: "Sections", icon: "📄", content: `## License\n\n[{license}](LICENSE) © 2024 {name}` },
  { id: "section-roadmap", label: "Roadmap", category: "Sections", icon: "🗺️", content: `## Roadmap\n\n- [x] Initial release\n- [ ] Feature two\n- [ ] Feature three` },
  { id: "section-faq", label: "FAQ", category: "Sections", icon: "❓", content: `## FAQ\n\n**Q: How do I do X?**\nA: You can do X by...\n\n**Q: Does it support Y?**\nA: Yes, Y is supported since version 1.x.` },
  { id: "section-demo", label: "Demo", category: "Sections", icon: "🎥", content: `## Demo\n\n![Demo]({gif-url})\n\nTry it live → [{demo-url}]({demo-url})` },
  { id: "section-prereqs", label: "Prerequisites", category: "Sections", icon: "📋", content: `## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n- A modern browser` },
  { id: "section-env", label: "Environment Variables", category: "Sections", icon: "🔐", content: `## Environment Variables\n\nCreate a \`.env\` file in the root:\n\n\`\`\`env\nAPI_KEY=your_api_key\nDATABASE_URL=your_db_url\n\`\`\`` },
  { id: "code-bash", label: "Bash block", category: "Code", icon: "💻", content: "```bash\nyour command here\n```" },
  { id: "code-js", label: "JavaScript block", category: "Code", icon: "🟨", content: "```js\nconst x = 'hello';\nconsole.log(x);\n```" },
  { id: "code-ts", label: "TypeScript block", category: "Code", icon: "🔷", content: "```ts\nconst greet = (name: string): string => {\n  return `Hello, ${name}`;\n};\n```" },
  { id: "code-python", label: "Python block", category: "Code", icon: "🐍", content: "```python\ndef greet(name: str) -> str:\n    return f'Hello, {name}'\n```" },
  { id: "comp-table", label: "Comparison Table", category: "Components", icon: "📊", content: `| Feature | This | Alternative |\n|---------|------|-------------|\n| Speed | ⚡ Fast | 🐢 Slow |\n| Size | Small | Large |\n| License | MIT | GPL |` },
  { id: "comp-alert-note", label: "Note alert", category: "Components", icon: "📘", content: `> **Note**\n> This is an important note about something.` },
  { id: "comp-alert-warn", label: "Warning alert", category: "Components", icon: "⚠️", content: `> **Warning**\n> Be careful about this thing.` },
  { id: "comp-contributors", label: "Contributors", category: "Components", icon: "👥", content: `## Contributors\n\nThanks to these wonderful people:\n\n<table>\n  <tr>\n    <td align="center"><a href="https://github.com/{user}"><img src="https://github.com/{user}.png" width="60px"/><br/><sub><b>{name}</b></sub></a></td>\n  </tr>\n</table>` },
  { id: "comp-toc", label: "Table of Contents", category: "Components", icon: "📑", content: `## Table of Contents\n\n- [Installation](#installation)\n- [Usage](#usage)\n- [Features](#features)\n- [Contributing](#contributing)\n- [License](#license)` },
  { id: "comp-stack", label: "Tech Stack", category: "Components", icon: "🛠️", content: `## Built With\n\n- [Next.js](https://nextjs.org) — Framework\n- [Tailwind CSS](https://tailwindcss.com) — Styling\n- [Supabase](https://supabase.com) — Database` },
  { id: "comp-banner", label: "Project Banner", category: "Components", icon: "🖼️", content: `<div align="center">\n  <img src="{banner-url}" alt="{name}" />\n  <h3>{name}</h3>\n  <p>{tagline}</p>\n</div>` },
  { id: "comp-shields-row", label: "Badge Row", category: "Components", icon: "🏷️", content: `<div align="center">\n\n![License](https://img.shields.io/badge/license-{license}-blue)\n![Version](https://img.shields.io/badge/version-{version}-green)\n![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen)\n\n</div>` },
  { id: "comp-support", label: "Support", category: "Components", icon: "☕", content: `## Support\n\nIf this helped you, consider [buying me a coffee](https://buymeacoffee.com/{username}) ☕` },
  { id: "comp-related", label: "Related Projects", category: "Components", icon: "🔗", content: `## Related\n\n- [{project-one}](https://github.com/{user}/{project-one}) — Does X\n- [{project-two}](https://github.com/{user}/{project-two}) — Does Y` },
  { id: "comp-acknowledgements", label: "Acknowledgements", category: "Components", icon: "🙏", content: `## Acknowledgements\n\n- [Awesome Library](https://github.com/example) for making X possible\n- [{person}](https://github.com/{person}) for inspiration` },
];

const CATEGORIES = ["Badges", "Sections", "Code", "Components"];

type Props = {
  onInsert: (snippet: string) => void;
  onClose: () => void;
};

export default function SnippetDrawer({ onInsert, onClose }: Props) {
  return (
    <div className="drawer-open w-full h-full"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border2)", boxShadow: "0 -16px 48px rgba(0,0,0,0.5)" }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "Geist", fontWeight: 500, fontSize: 13, color: "var(--text)" }}>Snippets</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{SNIPPETS.length} blocks · click to insert</span>
        </div>
        <button onClick={onClose} style={{ color: "var(--muted)", fontSize: 16, cursor: "pointer", background: "none", border: "none", lineHeight: 1 }}>✕</button>
      </div>
      <div className="overflow-y-auto" style={{ height: "calc(100% - 48px)" }}>
        {CATEGORIES.map(cat => (
          <div key={cat} className="px-5 py-3">
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: 10 }} className="uppercase">{cat}</div>
            <div className="flex flex-wrap gap-2">
              {SNIPPETS.filter(s => s.category === cat).map(snippet => (
                <button
                  key={snippet.id}
                  className="snippet-card"
                  onClick={() => onInsert(snippet.content)}
                  style={{
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 12, color: "var(--text)", whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{snippet.icon}</span>
                  {snippet.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}