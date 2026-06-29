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
    const existingData = await existing.json();
    if (existing.ok && existingData.sha) {
      sha = existingData.sha;
    }
  } catch (e) {
    console.error("SHA fetch error:", e);
  }

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

  const resData = await res.json();
  console.error("GitHub push response:", JSON.stringify(resData));

  if (!res.ok) return NextResponse.json({ error: resData }, { status: 400 });
  return NextResponse.json({ ok: true });
}