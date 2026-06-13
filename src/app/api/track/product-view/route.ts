import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/session";
import { recordProductView } from "@/lib/tracking/record";
import {
  getTrackingSessionId,
  withTrackingCookie,
} from "@/lib/tracking/session";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.uuid(),
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

    await recordProductView({
      productId: parsed.data.productId,
      profile: await getCurrentProfile(),
      sessionId,
      sourcePath: parsed.data.sourcePath,
    });
  } catch {
    return response;
  }

  return response;
}
