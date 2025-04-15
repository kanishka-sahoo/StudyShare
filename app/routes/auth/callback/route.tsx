import { redirect, type LoaderFunction } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";
import { getRedirectTo } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, response } = createClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error_description");
  const redirectTo = getRedirectTo(request);

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError) {
      return redirect(`/login?error=${encodeURIComponent(sessionError.message)}`);
    }
  }

  return redirect(redirectTo, { headers: response.headers });
};