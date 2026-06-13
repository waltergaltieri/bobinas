import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const trackingSessionCookie = "bobinas_tracking_session";

export function getTrackingSessionId(request: NextRequest) {
  return request.cookies.get(trackingSessionCookie)?.value ?? randomUUID();
}

export function withTrackingCookie(response: NextResponse, sessionId: string) {
  response.cookies.set(trackingSessionCookie, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
