import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession();
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { owner, repo, content } = await req.json();

  // get current SHA if README exists
  let sha: string | undefined;
  try {
    const existing = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
      headers: { Authorization: `Bearer ${accessToken}` }
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}