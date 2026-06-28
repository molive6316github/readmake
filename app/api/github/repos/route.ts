import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: { Authorization: auth }
  });
  const data = await res.json();
  return NextResponse.json(data);
}