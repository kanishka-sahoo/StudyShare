import { redirect, type LoaderFunction } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, response } = createClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect("/", { headers: response.headers });
};