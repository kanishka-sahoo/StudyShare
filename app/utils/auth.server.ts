import { redirect } from "@remix-run/node";
import { createClient } from "./supabase.server";

export async function requireAuth(request: Request) {
  const { supabase } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  return session;
}

export async function getSession(request: Request) {
  const { supabase } = createClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function getRedirectTo(request: Request): string {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";
  return redirectTo.startsWith("/") ? redirectTo : "/";
}