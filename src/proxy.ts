import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isEmailAllowed } from "@/lib/allowlist";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/access-denied"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() verifies the JWT locally (no round-trip to Supabase) and
  // transparently refreshes an expiring session, writing new cookies via
  // setAll above.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  const allowed = isEmailAllowed(email);

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!allowed && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = data ? "/access-denied" : "/login";
    return NextResponse.redirect(url);
  }

  if (allowed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/overview";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)"],
};
