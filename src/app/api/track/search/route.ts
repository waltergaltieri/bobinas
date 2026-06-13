import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/session";
import { recordSearch } from "@/lib/tracking/record";
import {
  getTrackingSessionId,
  withTrackingCookie,
} from "@/lib/tracking/session";

export const runtime = "nodejs";

const schema = z.object({
  query: z.string().max(200).default(""),
  filters: z.record(z.string(), z.string().optional()).optional(),
  resultsCount: z.coerce.number().int().min(0).default(0),
  sourcePath: z.string().max(300).optional(),
});

export async function POST(request: NextRequest) {
  const sessionId = getTrackingSessionId(request);
  const response = withTrackingCookie(NextResponse.json({ ok: true }), sessionId);

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return response;
    }

    await recordSearch({
      query: parsed.data.query,
      filters: parsed.data.filters,
      resultsCount: parsed.data.resultsCount,
      profile: await getCurrentProfile(),
      sessionId,
      sourcePath: parsed.data.sourcePath,
    });
  } catch {
    return response;
  }

  return response;
}
