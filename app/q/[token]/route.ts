import { NextResponse } from "next/server";
import { getUserByToken } from "@/lib/db";
import { guestPagePath } from "@/lib/urls";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * Dynamic QR landing. Always redirects to /u/<token> on the *same host*
 * that received the scan, so laptop (localhost) and Droplet (your domain)
 * each stay on their own origin. 302 so phones do not cache the target.
 */
export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const user = getUserByToken(token);
  if (!user) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.redirect(new URL(guestPagePath(user.token), request.url), 302);
}
