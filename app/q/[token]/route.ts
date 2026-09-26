import { NextResponse } from "next/server";
import { getUserByToken } from "@/lib/db";
import { resolveDestination } from "@/lib/urls";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * Dynamic QR landing: the printed code always points here.
 * Destination comes from APP_URL on the server.
 * 302 on purpose — 301 would be cached by phones and ignore later changes.
 */
export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const user = getUserByToken(token);
  if (!user) {
    return new NextResponse("Not found", { status: 404 });
  }

  const dest = resolveDestination(user.token);
  const location = dest.startsWith("http")
    ? dest
    : new URL(dest, request.url).toString();

  return NextResponse.redirect(location, 302);
}
