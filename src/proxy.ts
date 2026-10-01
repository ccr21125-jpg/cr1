import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/** Rotte che richiedono un utente autenticato. */
const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * In Next 16 il vecchio `middleware` si chiama `proxy` (vedi
 * node_modules/next/dist/docs/.../proxy.md).
 *
 * Qui si fanno due cose: rinnovare i cookie di sessione Supabase a ogni
 * richiesta — i Server Components non possono scriverli — e bloccare le rotte
 * riservate prima ancora che vengano renderizzate.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/accedi";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  /** Esclude asset statici e immagini: il proxy gira solo sulle pagine. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|logo.png|opengraph-image|robots.txt|sitemap.xml).*)"],
};
