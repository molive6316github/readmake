import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  const accessToken = (session as any)?.accessToken;
  if (!accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  return NextResponse.json(data);
}