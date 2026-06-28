import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { owner, repo, content } = await req.json();

  let sha: string | undefined;
  try {
    const existing = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
      headers: { Authorization: auth }
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch {}

  const body: any = {
    message: "docs: update README via readmake",
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) return NextResponse.json({ error: await res.json() }, { status: 400 });
  return NextResponse.json({ ok: true });
}