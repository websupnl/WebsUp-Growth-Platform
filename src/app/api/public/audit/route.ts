import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Publieke webhook: ontvang scan-aanvragen van websup.nl.
// Beveiligd met een gedeeld secret (WEBHOOK_SECRET env var).

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const authorization = req.headers.get("authorization");
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: { url?: string; email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { url, email, name } = body;
  if (!url || !email) {
    return NextResponse.json({ error: "url and email are required" }, { status: 422 });
  }

  const audit = await db.websiteAudit.create({
    data: {
      url,
      requesterEmail: email,
      requesterName: name ?? null,
      status: "AANGEVRAAGD",
    },
  });

  return NextResponse.json({ ok: true, id: audit.id }, { status: 201 });
}
